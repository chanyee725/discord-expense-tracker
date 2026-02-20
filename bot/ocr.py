from google.cloud import vision


def extract_text(image_bytes: bytes) -> str:
    """Extract Korean text from image via Google Cloud Vision OCR."""
    try:
        client = vision.ImageAnnotatorClient()
        image = vision.Image(content=image_bytes)
        image_context = vision.ImageContext(language_hints=['ko'])
        
        response = client.document_text_detection(
            image=image,
            image_context=image_context
        )
        
        if response.error.message:
            raise Exception(f"Vision API error: {response.error.message}")
        
        if response.text_annotations:
            return response.text_annotations[0].description
        else:
            return ""
            
    except Exception as e:
        raise Exception(f"OCR extraction failed: {str(e)}")
