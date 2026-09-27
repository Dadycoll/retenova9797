"""
RetinaCare - Python Web Application & REST Server
Author: Retinal Health Screening & Analysis Project

Provides a complete full-stack Python web application:
  - Serves interactive clinical web UI (Dashboard, New Screening, Patients, Reports)
  - Preprocessing pipeline (CLAHE, Green Channel, Vessel density)
  - Deep learning / rule-based Diabetic Retinopathy classification (ICDR Grades 0-4)
  - Inter-ocular bilateral asymmetry evaluation
  - REST API endpoints (/api/screenings, /api/analyze, /api/stats, /api/health)
"""

import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime

# Import local analysis and model modules
import model
import preprocessing
import evaluate

PORT = int(os.environ.get("PYTHON_PORT", os.environ.get("PORT", 5000)))

# In-memory storage for screening records
SCREENING_RECORDS = [
    {
        "id": "rec-demo-pt-101",
        "timestamp": "2026-08-16T10:00:00.000Z",
        "patient": {
            "id": "demo-pt-101",
            "name": "Elena Rostova",
            "patientNumber": "PT-2026-0814",
            "age": 58,
            "sex": "Female",
            "examDate": "2026-08-16",
            "diabetesStatus": "Type 2",
            "diabetesDuration": "8 years",
            "hba1c": "5.6%",
            "bloodGlucose": "112 mg/dL",
            "bloodPressure": "128/82 mmHg"
        },
        "overallCategory": "No obvious abnormality detected",
        "leftResult": {
            "side": "left",
            "grade": 0,
            "category": "No obvious abnormality detected",
            "vessel_density": 0.086,
            "lesions": {"microaneurysms": "None", "hemorrhages": "None", "hard_exudates": "None"},
            "recommendation": "Routine annual screening"
        },
        "rightResult": {
            "side": "right",
            "grade": 0,
            "category": "No obvious abnormality detected",
            "vessel_density": 0.085,
            "lesions": {"microaneurysms": "None", "hemorrhages": "None", "hard_exudates": "None"},
            "recommendation": "Routine annual screening"
        },
        "bilateralComparison": {
            "symmetry_score": 0.98,
            "grade_difference": 0,
            "is_asymmetric": False,
            "overall_category": "No obvious abnormality detected"
        }
    },
    {
        "id": "rec-demo-pt-102",
        "timestamp": "2026-08-28T10:00:00.000Z",
        "patient": {
            "id": "demo-pt-102",
            "name": "Arthur Pendelton",
            "patientNumber": "PT-2026-0902",
            "age": 44,
            "sex": "Male",
            "examDate": "2026-08-28",
            "diabetesStatus": "Type 1",
            "diabetesDuration": "14 years",
            "hba1c": "7.3%",
            "bloodGlucose": "148 mg/dL",
            "bloodPressure": "136/88 mmHg"
        },
        "overallCategory": "Possible mild retinal abnormalities",
        "leftResult": {
            "side": "left",
            "grade": 1,
            "category": "Possible mild retinal abnormalities",
            "vessel_density": 0.089,
            "lesions": {"microaneurysms": "Observed", "hemorrhages": "Suspected", "hard_exudates": "None"},
            "recommendation": "Repeat screening within 6-12 months"
        },
        "rightResult": {
            "side": "right",
            "grade": 1,
            "category": "Possible mild retinal abnormalities",
            "vessel_density": 0.088,
            "lesions": {"microaneurysms": "Observed", "hemorrhages": "None", "hard_exudates": "None"},
            "recommendation": "Repeat screening within 6-12 months"
        },
        "bilateralComparison": {
            "symmetry_score": 0.94,
            "grade_difference": 0,
            "is_asymmetric": False,
            "overall_category": "Possible mild retinal abnormalities"
        }
    },
    {
        "id": "rec-demo-pt-103",
        "timestamp": "2026-09-03T10:00:00.000Z",
        "patient": {
            "id": "demo-pt-103",
            "name": "Marcus Thorne",
            "patientNumber": "PT-2026-0919",
            "age": 62,
            "sex": "Male",
            "examDate": "2026-09-03",
            "diabetesStatus": "Type 1",
            "diabetesDuration": "22 years",
            "hba1c": "8.4%",
            "bloodGlucose": "175 mg/dL",
            "bloodPressure": "154/94 mmHg"
        },
        "overallCategory": "Possible severe retinal abnormalities",
        "leftResult": {
            "side": "left",
            "grade": 3,
            "category": "Possible severe retinal abnormalities",
            "vessel_density": 0.095,
            "lesions": {"microaneurysms": "Observed", "hemorrhages": "Observed", "hard_exudates": "Observed"},
            "recommendation": "Urgent prompt referral to retinal specialist"
        },
        "rightResult": {
            "side": "right",
            "grade": 2,
            "category": "Possible moderate retinal abnormalities",
            "vessel_density": 0.091,
            "lesions": {"microaneurysms": "Observed", "hemorrhages": "Observed", "hard_exudates": "Suspected"},
            "recommendation": "Referral to ophthalmology within 2-4 weeks"
        },
        "bilateralComparison": {
            "symmetry_score": 0.75,
            "grade_difference": 1,
            "is_asymmetric": False,
            "overall_category": "Possible severe retinal abnormalities"
        }
    },
    {
        "id": "rec-demo-pt-104",
        "timestamp": "2026-09-15T10:00:00.000Z",
        "patient": {
            "id": "demo-pt-104",
            "name": "David Miller",
            "patientNumber": "PT-2026-0945",
            "age": 53,
            "sex": "Male",
            "examDate": "2026-09-15",
            "diabetesStatus": "Type 2",
            "diabetesDuration": "11 years",
            "hba1c": "7.1%",
            "bloodGlucose": "142 mg/dL",
            "bloodPressure": "134/86 mmHg"
        },
        "overallCategory": "Possible moderate retinal abnormalities",
        "leftResult": {
            "side": "left",
            "grade": 2,
            "category": "Possible moderate retinal abnormalities",
            "vessel_density": 0.091,
            "lesions": {"microaneurysms": "Observed", "hemorrhages": "Observed", "hard_exudates": "None"},
            "recommendation": "Referral to ophthalmology within 2-4 weeks"
        },
        "rightResult": {
            "side": "right",
            "grade": 2,
            "category": "Possible moderate retinal abnormalities",
            "vessel_density": 0.090,
            "lesions": {"microaneurysms": "Observed", "hemorrhages": "Observed", "hard_exudates": "None"},
            "recommendation": "Referral to ophthalmology within 2-4 weeks"
        },
        "bilateralComparison": {
            "symmetry_score": 0.96,
            "grade_difference": 0,
            "is_asymmetric": False,
            "overall_category": "Possible moderate retinal abnormalities"
        }
    },
    {
        "id": "rec-demo-pt-105",
        "timestamp": "2026-09-24T10:00:00.000Z",
        "patient": {
            "id": "demo-pt-105",
            "name": "Sophia Chen",
            "patientNumber": "PT-2026-0988",
            "age": 49,
            "sex": "Female",
            "examDate": "2026-09-24",
            "diabetesStatus": "Type 2",
            "diabetesDuration": "4 years",
            "hba1c": "6.9%",
            "bloodGlucose": "128 mg/dL",
            "bloodPressure": "122/78 mmHg"
        },
        "overallCategory": "No obvious abnormality detected",
        "leftResult": {
            "side": "left",
            "grade": 0,
            "category": "No obvious abnormality detected",
            "vessel_density": 0.084,
            "lesions": {"microaneurysms": "None", "hemorrhages": "None", "hard_exudates": "None"},
            "recommendation": "Routine annual screening"
        },
        "rightResult": {
            "side": "right",
            "grade": 0,
            "category": "No obvious abnormality detected",
            "vessel_density": 0.084,
            "lesions": {"microaneurysms": "None", "hemorrhages": "None", "hard_exudates": "None"},
            "recommendation": "Routine annual screening"
        },
        "bilateralComparison": {
            "symmetry_score": 0.99,
            "grade_difference": 0,
            "is_asymmetric": False,
            "overall_category": "No obvious abnormality detected"
        }
    }
]

NEARBY_DOCTORS = [
    {
        "id": "doc-1",
        "name": "Dr. Rajesh V. Sharma, MS, FICO",
        "age": 52,
        "experience": 25,
        "qualification": "MBBS, MS (Ophthalmology, AIIMS New Delhi), FICO (UK), Fellowship in Vitreoretina (LVPEI)",
        "specialty": "Senior Vitreoretinal Consultant & Macular Specialist",
        "clinicName": "Aravind Advanced Retina & Vitreous Center",
        "clinicNumber": "+91 98201 44521",
        "address": "42 Kasturba Gandhi Marg, Connaught Place, New Delhi",
        "distance": 1.2,
        "rating": 4.96,
        "reviewCount": 428,
        "consultationFee": "₹1,200 (CGHS / Cashless TPA Accepted)",
        "availability": "Available Today • 9:00 AM - 4:30 PM",
        "acceptingReferrals": True,
        "expertiseTags": ["Diabetic Retinopathy", "Panretinal Photocoagulation", "Micro-incision Vitrectomy", "Laser Surgery"]
    },
    {
        "id": "doc-2",
        "name": "Dr. Priya Nambiar, MBBS, MS, FRCS",
        "age": 42,
        "experience": 16,
        "qualification": "MBBS, MS (Ophthalmology, CMC Vellore), FRCS (Glasgow), Fellowship in Retina (Sankara Nethralaya)",
        "specialty": "Vitreoretinal Surgeon & Diabetic Eye Specialist",
        "clinicName": "Sankara Nethralaya Specialty Retina Suite",
        "clinicNumber": "+91 80 4123 7890",
        "address": "18 College Road, Nungambakkam, Chennai",
        "distance": 2.4,
        "rating": 4.94,
        "reviewCount": 365,
        "consultationFee": "₹1,000 (Insurance Accepted)",
        "availability": "Available Today • 10:00 AM - 5:30 PM",
        "acceptingReferrals": True,
        "expertiseTags": ["Severe NPDR", "Anti-VEGF Therapy", "Diabetic Macular Edema", "Fundus Angiography"]
    },
    {
        "id": "doc-3",
        "name": "Dr. Arvind Swaminathan, MD, DNB",
        "age": 48,
        "experience": 22,
        "qualification": "MBBS, MD (Ophthalmology, PGI Chandigarh), DNB, Vitreoretinal Fellowship (Aravind Eye Care System)",
        "specialty": "Vitreoretinal Microsurgery & Proliferative DR Expert",
        "clinicName": "Netralaya Super Specialty Eye Institute",
        "clinicNumber": "+91 22 2845 9912",
        "address": "302 High Street Corporate Wing, Worli, Mumbai",
        "distance": 3.5,
        "rating": 4.91,
        "reviewCount": 512,
        "consultationFee": "₹1,500 (Corporate & Private Panels)",
        "availability": "Next Slot: Tomorrow at 10:15 AM",
        "acceptingReferrals": True,
        "expertiseTags": ["Proliferative DR (PDR)", "Vitrectomy 25G/27G", "Tractional Retinal Detachment", "Endolaser"]
    },
    {
        "id": "doc-4",
        "name": "Dr. Sunita Kulkarni, MS, FLVPEI",
        "age": 40,
        "experience": 14,
        "qualification": "MBBS, MS (Ophthalmology, KEM Hospital Mumbai), Fellowship in Vitreoretina (L.V. Prasad Eye Institute)",
        "specialty": "Medical Retina, Uveitis & Ophthalmic Microvascular Imaging",
        "clinicName": "Apollo Sugar & Retina Clinic",
        "clinicNumber": "+91 40 2360 7777",
        "address": "Road No. 72, Jubilee Hills, Hyderabad",
        "distance": 4.8,
        "rating": 4.89,
        "reviewCount": 284,
        "consultationFee": "₹900 (All Major TPAs Covered)",
        "availability": "Available Today • 1:00 PM - 6:00 PM",
        "acceptingReferrals": True,
        "expertiseTags": ["Early DR Detection", "OCT-Angiography", "Macular Ischemia", "Tele-Retinopathy"]
    },
    {
        "id": "doc-5",
        "name": "Dr. Vikramaditya Reddy, MS, FACS",
        "age": 55,
        "experience": 28,
        "qualification": "MBBS, MS (Ophthalmology), FACS, Fellowship in Vitreoretinal Surgery (Narayana Nethralaya)",
        "specialty": "Senior Vitreoretinal Surgeon & Ophthalmic Trauma",
        "clinicName": "Narayana Nethralaya Diabetic Retina Center",
        "clinicNumber": "+91 80 6612 1400",
        "address": "121/C Chord Road, Rajajinagar 1st R Block, Bengaluru",
        "distance": 6.2,
        "rating": 4.87,
        "reviewCount": 630,
        "consultationFee": "₹1,100 (ECHS / Ayushman / TPA)",
        "availability": "Available Thursday • 8:30 AM - 3:00 PM",
        "acceptingReferrals": True,
        "expertiseTags": ["Complex Retinal Detachment", "Vitreous Hemorrhage", "PDR Laser", "Scleral Buckling"]
    },
    {
        "id": "doc-6",
        "name": "Dr. Meenakshi Sundaram, MD, FICO",
        "age": 38,
        "experience": 12,
        "qualification": "MBBS, MD (Ophthalmology, AIIMS), FICO (UK), Fellowship in Retinal Lasers & Angiography",
        "specialty": "Comprehensive Ophthalmology & Diabetic Retinopathy",
        "clinicName": "Max Vision Diabetic Eye Care Wing",
        "clinicNumber": "+91 11 4055 4055",
        "address": "1 Press Enclave Marg, Saket, New Delhi",
        "distance": 8.5,
        "rating": 4.82,
        "reviewCount": 198,
        "consultationFee": "₹800 (Govt & Commercial Panels)",
        "availability": "Available Friday • 9:00 AM - 2:00 PM",
        "acceptingReferrals": False,
        "expertiseTags": ["Diabetic Cataract", "Retinal Screening", "Fluorescein Angiography", "Argon Laser"]
    }
]


def calculate_cohort_stats():
    """Calculates distribution of screening categories and metrics."""
    categories = {
        "No obvious abnormality detected": 0,
        "Possible mild retinal abnormalities": 0,
        "Possible moderate retinal abnormalities": 0,
        "Possible severe retinal abnormalities": 0,
        "Unable to complete assessment due to image quality": 0
    }

    hba1c_readings = []
    for r in SCREENING_RECORDS:
        cat = r.get("overallCategory", "No obvious abnormality detected")
        if cat in categories:
            categories[cat] += 1
        
        pt = r.get("patient", {})
        if pt.get("hba1c"):
            try:
                val = float(str(pt["hba1c"]).replace("%", "").strip())
                hba1c_readings.append({
                    "date": pt.get("examDate", ""),
                    "patientName": pt.get("name", ""),
                    "hba1c": val,
                    "targetMet": val <= 7.0
                })
            except ValueError:
                pass

    hba1c_readings.sort(key=lambda x: x["date"])
    last_5 = hba1c_readings[-5:]
    avg_hba1c = round(sum(item["hba1c"] for item in last_5) / len(last_5), 2) if last_5 else 0.0

    return {
        "total_screenings": len(SCREENING_RECORDS),
        "total_patients": len(set(r.get("patient", {}).get("patientNumber", "") for r in SCREENING_RECORDS)),
        "category_distribution": categories,
        "cohort_average_hba1c": avg_hba1c
    }


def get_html_template():
    """Reads templates/index.html or returns fallback."""
    tmpl_path = os.path.join(os.path.dirname(__file__), "templates", "index.html")
    if os.path.exists(tmpl_path):
        with open(tmpl_path, "r", encoding="utf-8") as f:
            return f.read()
    return "<h1>RetinaCare Python Web Application</h1><p>Template file not found.</p>"


class RetinalAPIRequestHandler(BaseHTTPRequestHandler):
    """HTTP request handler serving the full web application and REST API."""

    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # 1. Main Website Entry Point
        if path == "/" or path == "/index.html":
            html_content = get_html_template()
            self._set_headers(200, content_type="text/html; charset=utf-8")
            self.wfile.write(html_content.encode('utf-8'))

        # 2. REST API: Health Check
        elif path == "/api/health" or path == "/api":
            resp = {
                "system": "RetinaCare Python Web Application & Screening API",
                "version": "2.0.0",
                "status": "healthy",
                "endpoints": [
                    "GET  /",
                    "GET  /api/health",
                    "GET  /api/screenings",
                    "GET  /api/doctors",
                    "POST /api/screenings",
                    "POST /api/analyze",
                    "GET  /api/stats",
                    "GET  /api/evaluate"
                ]
            }
            self._set_headers(200)
            self.wfile.write(json.dumps(resp, indent=2).encode('utf-8'))

        # 3. REST API: Screenings List
        elif path == "/api/screenings":
            self._set_headers(200)
            self.wfile.write(json.dumps(SCREENING_RECORDS, indent=2).encode('utf-8'))

        # 4. REST API: Nearby & Best Rated Doctors
        elif path == "/api/doctors":
            self._set_headers(200)
            self.wfile.write(json.dumps(NEARBY_DOCTORS, indent=2).encode('utf-8'))

        # 5. REST API: Cohort Stats
        elif path == "/api/stats":
            stats = calculate_cohort_stats()
            self._set_headers(200)
            self.wfile.write(json.dumps(stats, indent=2).encode('utf-8'))

        # 5. REST API: Benchmark Validation Metrics
        elif path == "/api/evaluate":
            eval_results = evaluate.run_benchmark_validation()
            self._set_headers(200)
            self.wfile.write(json.dumps(eval_results, indent=2).encode('utf-8'))

        else:
            self._set_headers(404, content_type="application/json")
            self.wfile.write(json.dumps({"error": f"Path not found: {path}"}).encode('utf-8'))

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else "{}"

        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            payload = {}

        # 1. Automated Screening & Model Inference
        if path == "/api/analyze":
            patient = payload.get("patient", {})
            left_img = payload.get("left_image", None)
            right_img = payload.get("right_image", None)

            # Preprocessing pipeline
            left_prep = preprocessing.preprocess_fundus_pipeline(left_img)
            right_prep = preprocessing.preprocess_fundus_pipeline(right_img)

            # Model inference
            left_res = model.predict_eye("left", left_img, clinical_context=patient)
            right_res = model.predict_eye("right", right_img, clinical_context=patient)
            bilateral = model.compare_bilateral_eyes(left_res, right_res)

            response_data = {
                "status": "success",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "patient": patient,
                "overallCategory": bilateral["overall_category"],
                "leftResult": left_res,
                "rightResult": right_res,
                "bilateralComparison": bilateral,
                "preprocessing": {
                    "left_vessel_density": left_prep["vessel_density"],
                    "right_vessel_density": right_prep["vessel_density"]
                }
            }
            self._set_headers(200)
            self.wfile.write(json.dumps(response_data, indent=2).encode('utf-8'))

        # 2. Record Persistence
        elif path == "/api/screenings":
            if payload:
                record_id = payload.get("id", f"rec-{int(datetime.utcnow().timestamp())}")
                payload["id"] = record_id
                payload["timestamp"] = datetime.utcnow().isoformat() + "Z"
                SCREENING_RECORDS.insert(0, payload)
                self._set_headers(201)
                self.wfile.write(json.dumps({"status": "saved", "record": payload}).encode('utf-8'))
            else:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Empty payload"}).encode('utf-8'))

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": f"Path not found: {path}"}).encode('utf-8'))


def run_server(port=PORT):
    """Starts the Python web application server."""
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, RetinalAPIRequestHandler)
    print("=" * 65)
    print(f"  RETINACARE PYTHON WEB APPLICATION SERVER")
    print(f"  Server URL   : http://localhost:{port}/")
    print(f"  Health Check : http://localhost:{port}/api/health")
    print(f"  Screenings   : http://localhost:{port}/api/screenings")
    print("=" * 65)
    print(f"Serving website on port {port}. Press Ctrl+C to stop.\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
        httpd.server_close()


if __name__ == "__main__":
    run_server()
