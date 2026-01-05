import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from typing import Dict
import cloudinary
import cloudinary.uploader
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/upload", tags=["upload"])

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# Image Upload Limits and Constraints
# Maximum file size allowed per image (5MB)
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes
MAX_FILE_SIZE_MB = 5  # For display in error messages

# Allowed image MIME types
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp"
}

# Allowed image file extensions (for additional validation)
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

# User-friendly format names for error messages
ALLOWED_FORMATS_DISPLAY = "JPEG, PNG, GIF, WebP"


@router.post("/image", response_model=Dict[str, str])
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload an image to Cloudinary.
    
    Enforces the following limits:
    - Maximum file size: 5MB
    - Allowed formats: JPEG, PNG, GIF, WebP
    - Maximum count: 1 image per upload
    
    Requires authentication.
    Returns the Cloudinary URL.
    """
    # Validate filename exists
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file format. Please upload a {ALLOWED_FORMATS_DISPLAY} image."
        )
    
    # Validate MIME type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type detected. Please upload a {ALLOWED_FORMATS_DISPLAY} image."
        )
    
    # Read file content
    contents = await file.read()
    
    # Validate file is not empty
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty. Please select a valid image."
        )
    
    # Validate file size
    file_size_mb = len(contents) / (1024 * 1024)
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large: {file_size_mb:.1f}MB exceeds the {MAX_FILE_SIZE_MB}MB limit."
        )
    
    try:
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder="questionaura",
            resource_type="image"
        )
        
        return {
            "url": result["secure_url"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )
