from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Keep existing DB model for compatibility
class LoanApplicationResponse(BaseModel):
    id: int
    default_probability: Optional[float]
    is_default_predicted: Optional[bool]
    created_at: datetime
    
    class Config:
        from_attributes = True
