# ML Models (local-only, not committed)

This folder is used to store **large ML model files locally** for the Disease Detection pipeline.

In this repo, the disease flow is:

**React frontend** → **Node/Express backend** → **FastAPI ML service (`ml-service/`)**

The ML service will load model files from this `ml-service/models/` folder.

## Why this folder is gitignored
Model artifacts downloaded from Hugging Face can be large (hundreds of MB) and may include many files.
To keep the repository lightweight and avoid committing binaries, we **do not commit** anything under:

- `ml-service/models/`

## Download the Hugging Face model snapshot

This project uses only a **Rice leaf disease** pre-trained image classifier (Punjab-aligned scope).

- `prithivMLmods/Rice-Leaf-Disease`

The download target folder is:

- `ml-service/models/rice_model/`

### Run (PowerShell)

From the repo root:

```powershell
cd ml-service\scripts
./download_rice_model.ps1
```

This script:
- checks that `python` is available
- upgrades `pip`
- installs/upgrades `huggingface_hub`
- downloads the snapshot using `huggingface_hub.snapshot_download(..., local_dir_use_symlinks=False)`

## What files should exist after download

After download, you should see files like:

- `ml-service/models/rice_model/config.json`
- `ml-service/models/rice_model/preprocessor_config.json` (or an equivalent preprocessor file)
- One of:
  - `ml-service/models/rice_model/model.safetensors` **or**
  - `ml-service/models/rice_model/pytorch_model.bin`

Depending on the model repo, there may also be additional files (tokenizer/config/README).

## Supported classes (as implemented)
The model currently supports 5 outputs:
- Bacterialblight
- Blast
- Brownspot
- Healthy
- Tungro

## Inference behavior (service-side)
The FastAPI service (`ml-service/app.py`) will:
- run CPU inference using the locally downloaded model (`local_files_only=True`)
- apply **label normalization** for remedy mapping:
  - lowercased
  - remove spaces and underscores
- apply a confidence threshold (`CONF_THRESHOLD`, default **0.55**)
  - if confidence is low, the response becomes **Unknown**

Note:
- `ml-service/remedy_map.json` uses **normalized keys** (example: `brownspot`, `bacterialblight`).
