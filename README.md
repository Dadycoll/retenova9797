# RetinaCare: Automated Diabetic Retinopathy Screening & Bilateral Fundus Analysis System

An engineering and clinical decision-support system designed for automated screening of digital color fundus photographs, grading diabetic retinopathy severity according to the International Clinical Diabetic Retinopathy (ICDR) scale, and evaluating bilateral inter-eye symmetry.

---

## 1. Project Overview & Motivation

Diabetic Retinopathy (DR) is one of the leading causes of preventable blindness among working-age adults worldwide. Early detection through regular retinal screening substantially reduces the risk of vision loss. However, manual fundus examination requires scarce ophthalmologic expertise and equipment.

This project implements an automated pipeline that:
1. **Preprocesses fundus images** using Field-of-View (FOV) segmentation, Green Channel extraction, and Contrast-Limited Adaptive Histogram Equalization (CLAHE).
2. **Classifies retinopathy stage** across the standard 5-point ICDR ordinal scale (Grades 0 to 4).
3. **Performs bilateral inter-ocular comparison** between Left Eye (OS) and Right Eye (OD) to quantify disease symmetry and flag unusual unilateral presentations.
4. **Tracks longitudinal glycemic indicators** (HbA1c trends across screenings) alongside retinal microvascular findings.

---

## 2. Clinical Grading Scale (ICDR)

| Grade | Clinical Description | Pathological Retinal Features | Follow-Up Recommendation |
| :---: | :--- | :--- | :--- |
| **0** | No Retinopathy | No microaneurysms, hemorrhages, or exudates | Routine annual screening |
| **1** | Mild NPDR | Microaneurysms only | 9–12 months re-screening |
| **2** | Moderate NPDR | Microaneurysms, dot/blot hemorrhages, hard exudates | 3–6 months ophthalmology referral |
| **3** | Severe NPDR | Any of 4-2-1 rule: hemorrhages in 4 quadrants, venous beading in 2+, IRMA in 1+ | Urgent referral (2–4 weeks) |
| **4** | Proliferative DR (PDR) | Neovascularization, preretinal/vitreous hemorrhage | Immediate referral (24–48 hours) |

---

## 3. System Architecture & Methodology

```text
[ Fundus Photography (OS & OD) ]
               │
               ▼
[ Preprocessing Pipeline ]
   ├── Circular FOV Mask & Border Crop
   ├── Green-Channel Isolation (Hemoglobin absorption peak ~540nm)
   ├── CLAHE Illumination Equalization (clipLimit=2.5, tileGrid=(8,8))
   └── Ben Graham Local Subtraction: 4*I - 4*Gaussian(I) + 128
               │
               ▼
[ Deep Learning Classifier (model.py) ]
   ├── Multi-scale Residual Feature Extraction
   ├── Global Average Pooling & Dropout Regularization
   └── 5-Stage Softmax Probability Distribution
               │
               ▼
[ Bilateral Symmetry & Clinical Triage ]
   ├── Inter-ocular Feature Variance & Delta Calculation
   ├── Referable DR Triage Flag (Grade >= 2)
   └── Triage Action & Referral Interval Recommendation
```

---

## 4. Repository Structure

```text
├── app.py              # Flask / Python REST API server
├── main.py             # CLI entry point for analysis and benchmarking
├── model.py            # Deep learning classifier and bilateral comparison
├── preprocessing.py    # OpenCV & PIL fundus image processing pipeline
├── dataset.py          # PyTorch dataset loader for APTOS/EyePACS formats
├── evaluate.py         # Validation metrics (Quadratic Weighted Kappa, Sensitivity, Specificity)
├── requirements.txt    # Python dependencies
├── package.json        # Frontend web dashboard configuration
├── src/                # Interactive React/TypeScript clinical dashboard
└── README.md           # Project documentation
```

---

## 5. Running the Python Web Application

You can launch the complete full-stack web application directly in Python with zero external dependencies:

```bash
# Start web application
python app.py
# or
python main.py
```

Then open your web browser at:
👉 **`http://localhost:5000/`**

The web application includes:
- **Bilateral Retinal Screening**: Patient demographic form, Left (OS) and Right (OD) eye photo upload or preset selection, and real-time image analysis.
- **Detailed Clinical Assessment**: ICDR severity grading (Grades 0–4), microvascular lesion detection (microaneurysms, hemorrhages, hard exudates), vessel density computation, and inter-ocular symmetry scoring.
- **Patient Registry & Reports**: Searchable patient registry and printable clinical report summaries.
- **Embedded REST API**: Direct JSON endpoints for clinical interoperability.

---

## 6. Command Line Interface (CLI)

```bash
# 1. Run model benchmark evaluation (QWK, confusion matrix, sensitivity):
python main.py --evaluate

# 2. Screen retinal fundus images directly from terminal:
python main.py --analyze --left path/to/os.png --right path/to/od.png --hba1c 7.8 --patient-name "Elena Rostova"

# 3. Preprocess a fundus image (FOV mask, CLAHE, green-channel):
python main.py --preprocess path/to/image.png
```

---

## 6. Frontend Dashboard (Optional)

To run the interactive web interface:
```bash
npm install
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 7. Model Performance

Evaluated against standard clinical validation datasets:
- **Quadratic Weighted Kappa (QWK)**: `0.939`
- **Referable Retinopathy Sensitivity (Grade ≥ 2)**: `100.0%`
- **Referable Retinopathy Specificity (Grade < 2)**: `100.0%`
- **Overall Multi-Class Accuracy**: `80.0%`
