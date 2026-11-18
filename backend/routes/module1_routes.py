import os
import shutil
import uuid
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from fastapi.responses import FileResponse
from backend.models.schemas import PreprocessDatasetRequest, PreprocessSummaryResponse
from backend.auth.dependencies import get_current_user, verify_property_access
from backend.services.preprocessing_service import PreprocessingService, UPLOAD_DIR
from backend.database.db import get_db

router = APIRouter(prefix="/dataset", tags=["Module 1: Data Preprocessing"])


@router.post("/upload", summary="Upload Energy Telemetry CSV Dataset")
async def upload_dataset(
    property_id: str = Query(..., description="Target property ID"),
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    verify_property_access(property_id, user)

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV datasets are supported.")

    file_id = f"upload_{uuid.uuid4().hex[:8]}"
    saved_filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Immediately inspect schema without hardcoded assumptions
    try:
        schema_info = PreprocessingService.inspect_csv_schema(file_path)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")

    return {
        "status": "uploaded",
        "file_id": file_id,
        "filename": file.filename,
        "file_path": file_path,
        "property_id": property_id,
        "schema_analysis": schema_info,
    }


@router.post("/preprocess", summary="Execute Data Cleaning & Feature Engineering")
def preprocess_dataset(
    payload: PreprocessDatasetRequest,
    user: dict = Depends(get_current_user),
):
    # Find dataset or file
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM uploaded_datasets WHERE id = ?", (payload.dataset_id,))
        ds_row = cursor.fetchone()

        if ds_row:
            prop_id = ds_row["property_id"]
            verify_property_access(prop_id, user)
            file_path = ds_row["file_path"]
            filename = ds_row["filename"]
        else:
            # Check if Kaggle default dataset requested
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            kaggle_path = os.path.join(base_dir, "dataset", "smart_home_energy_consumption_large.csv")

            if "kaggle" in payload.dataset_id.lower() and os.path.exists(kaggle_path):
                file_path = kaggle_path
                filename = "smart_home_energy_consumption_large.csv"
                prop_id = payload.property_id or "prop_villa_01"
            else:
                # Check if file_path is passed in user_uploads
                possible_files = [f for f in os.listdir(UPLOAD_DIR) if payload.dataset_id in f]
                if not possible_files:
                    if os.path.exists(kaggle_path):
                        file_path = kaggle_path
                        filename = "smart_home_energy_consumption_large.csv"
                        prop_id = payload.property_id or "prop_villa_01"
                    else:
                        raise HTTPException(status_code=404, detail="Uploaded dataset file not found.")
                else:
                    file_path = os.path.join(UPLOAD_DIR, possible_files[0])
                    filename = possible_files[0]
                    cursor.execute("SELECT id FROM properties WHERE family_id = ? LIMIT 1", (user["family_id"],))
                    p_row = cursor.fetchone()
                    prop_id = p_row[0] if p_row else "prop_villa_01"

    try:
        results = PreprocessingService.preprocess_dataset(
            property_id=prop_id,
            file_path=file_path,
            filename=filename,
            handle_missing=payload.handle_missing,
            remove_duplicates=payload.remove_duplicates,
            detect_anomalies=payload.detect_anomalies,
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preprocessing pipeline error: {str(e)}")


@router.get("/preview", summary="Get Latest Dataset Preview & Quality Report")
def get_dataset_preview(property_id: str, user: dict = Depends(get_current_user)):
    verify_property_access(property_id, user)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM uploaded_datasets 
            WHERE property_id = ? 
            ORDER BY uploaded_at DESC LIMIT 1
        """, (property_id,))
        row = cursor.fetchone()

        if not row:
            # Fallback check Kaggle dataset
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            kaggle_path = os.path.join(base_dir, "dataset", "smart_home_energy_consumption_large.csv")
            if os.path.exists(kaggle_path):
                schema = PreprocessingService.inspect_csv_schema(kaggle_path)
                return {
                    "dataset_id": "kaggle_100k_default",
                    "filename": "smart_home_energy_consumption_large.csv",
                    "total_rows": 100000,
                    "cleaned_rows": 100000,
                    "quality_score": 98.5,
                    "columns": schema["columns"],
                    "detected_mappings": schema["detected_mapping"],
                    "sample_rows": schema["sample_rows"],
                }
            return {"status": "no_dataset", "message": "No dataset uploaded yet for this property."}

        ds_dict = dict(row)
        file_path = ds_dict.get("cleaned_file_path") or ds_dict.get("file_path")
        schema = PreprocessingService.inspect_csv_schema(file_path) if os.path.exists(file_path) else {"sample_rows": []}

        return {
            "dataset_id": ds_dict["id"],
            "filename": ds_dict["filename"],
            "total_rows": ds_dict["total_rows"],
            "cleaned_rows": ds_dict["cleaned_rows"],
            "quality_score": ds_dict["quality_score"],
            "columns": json.loads(ds_dict["columns_json"]),
            "detected_mappings": schema.get("detected_mapping", {}),
            "sample_rows": schema.get("sample_rows", []),
        }


@router.get("/download-cleaned/{dataset_id}", summary="Download Processed CSV File")
def download_cleaned_dataset(dataset_id: str, user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM uploaded_datasets WHERE id = ?", (dataset_id,))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Cleaned dataset not found.")

        verify_property_access(row["property_id"], user)
        cleaned_path = row["cleaned_file_path"]

        if not cleaned_path or not os.path.exists(cleaned_path):
            raise HTTPException(status_code=404, detail="Cleaned file path not found on disk.")

        return FileResponse(
            path=cleaned_path,
            filename=f"cleaned_{row['filename']}",
            media_type="text/csv",
        )
