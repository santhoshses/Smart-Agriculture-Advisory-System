from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ML Inference Service (Stub)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"] ,
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict-disease")
async def predict_disease(image: UploadFile = File(...)):
    # Stub response (Step 4.1) — no real model.
    # We return a deterministic fake output so the full pipeline can be tested.
    _ = await image.read()  # read to ensure upload works; not used.

    return {
        "crop": "wheat",
        "disease": "leaf_rust",
        "confidence": 0.78,
        "remedyKey": "wheat_leaf_rust_basic",
    }

