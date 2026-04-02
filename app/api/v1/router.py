"""
API v1 Router - app/api/v1/router.py
"""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, governance, inventory, properties, sop, workforce

router = APIRouter(prefix="/v1")

router.include_router(auth.router)
router.include_router(properties.router)
router.include_router(workforce.dept_router)
router.include_router(workforce.emp_router)
router.include_router(workforce.vendor_router)
router.include_router(inventory.router)
router.include_router(sop.router)
router.include_router(governance.router)
