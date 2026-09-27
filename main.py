"""
RetinaCare - Diabetic Retinopathy Screening & Bilateral Analysis CLI
Author: Retinal Health Screening & Analysis Project

Usage Examples:
  1. Start REST API server:
     python main.py --serve --port 5000

  2. Run validation benchmarks (QWK, Sensitivity, Specificity):
     python main.py --evaluate

  3. Screen retinal images directly from command line:
     python main.py --analyze --left images/sample_os.png --right images/sample_od.png --hba1c 8.2

  4. Run image preprocessing pipeline:
     python main.py --preprocess images/sample_os.png
"""

import argparse
import sys
import json

import model
import preprocessing
import evaluate
import app


def parse_args():
    parser = argparse.ArgumentParser(
        description="RetinaCare: Automated Diabetic Retinopathy Screening System",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument("--serve", action="store_true", help="Start the Python REST API server")
    parser.add_argument("--port", type=int, default=5000, help="Port to bind the server (default: 5000)")
    parser.add_argument("--evaluate", action="store_true", help="Run benchmark validation report (QWK, confusion matrix)")
    parser.add_argument("--analyze", action="store_true", help="Perform screening on bilateral fundus images")
    parser.add_argument("--left", type=str, help="Path to Left Eye (OS) fundus photograph")
    parser.add_argument("--right", type=str, help="Path to Right Eye (OD) fundus photograph")
    parser.add_argument("--hba1c", type=str, default="7.0", help="Patient HbA1c value (e.g. 7.5%%)")
    parser.add_argument("--patient-name", type=str, default="Screening Patient", help="Patient Name")
    parser.add_argument("--preprocess", type=str, help="Run image preprocessing pipeline on given image")

    return parser.parse_args()


def main():
    args = parse_args()

    if args.serve:
        app.run_server(port=args.port)
        return

    if args.evaluate:
        evaluate.run_benchmark_validation()
        return

    if args.preprocess:
        print(f"[Preprocessing] Processing retinal fundus image: {args.preprocess}")
        result = preprocessing.preprocess_fundus_pipeline(args.preprocess)
        print(json.dumps(result, indent=2))
        return

    if args.analyze or (args.left and args.right):
        print("=" * 60)
        print("RETINACARE CLINICAL SCREENING PIPELINE")
        print("=" * 60)
        print(f"Patient       : {args.patient_name}")
        print(f"HbA1c Level   : {args.hba1c}")
        print(f"Left Eye (OS) : {args.left or 'Default clinical fundus'}")
        print(f"Right Eye (OD): {args.right or 'Default clinical fundus'}")
        print("-" * 60)

        context = {"name": args.patient_name, "hba1c": args.hba1c}
        left_res = model.predict_eye("left", args.left, clinical_context=context)
        right_res = model.predict_eye("right", args.right, clinical_context=context)
        bilateral = model.compare_bilateral_eyes(left_res, right_res)

        print("\n[Screening Classification Results]")
        print(f"  Overall Category    : {bilateral['overall_category']}")
        print(f"  Left Eye (OS)       : Grade {left_res['grade']} ({left_res['icdr_name']})")
        print(f"  Right Eye (OD)      : Grade {right_res['grade']} ({right_res['icdr_name']})")
        print(f"  Bilateral Symmetry  : {bilateral['symmetry_score'] * 100:.1f}%")
        print(f"  Asymmetry Flagged   : {'YES' if bilateral['is_asymmetric'] else 'NO'}")
        print(f"  Clinical Action     : {left_res['recommendation']}")
        print("=" * 60)
        return

    # If no flags passed, launch the web application server
    print("No flags specified. Starting RetinaCare Python Web Application...")
    print("Tip: Run 'python main.py --help' to see command-line evaluation and analysis options.\n")
    app.run_server(port=args.port)


if __name__ == "__main__":
    main()
