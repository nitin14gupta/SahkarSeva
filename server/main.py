from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import router as auth_router
from routes.catalog import router as catalog_router
from routes.bookings import router as bookings_router
from routes.addresses import router as addresses_router
from routes.payments import router as payments_router
from routes.reviews import router as reviews_router
from routes.favorites import router as favorites_router
from routes.support import router as support_router
from routes.uploads import router as uploads_router

app = FastAPI(title="SahkarSeva API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(catalog_router)
app.include_router(bookings_router)
app.include_router(addresses_router)
app.include_router(payments_router)
app.include_router(reviews_router)
app.include_router(favorites_router)
app.include_router(support_router)
app.include_router(uploads_router)


@app.get("/health")
def health():
    return {"status": "ok"}
