import os
import csv
import torch
import torch.nn as nn

from PIL import Image
from torchvision import models, transforms


# =========================================================
# 1. Device
# =========================================================

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Using device:", device)


# =========================================================
# 2. Paths
# =========================================================

DATASET_PATH = (
    r"C:\Users\Vamsi\Downloads\GroceryStoreDataset-master"
    r"\GroceryStoreDataset-master\dataset"
)

MODEL_PATH = os.path.join(
    DATASET_PATH,
    "grocery_resnet18.pth"
)

CLASSES_FILE = os.path.join(
    DATASET_PATH,
    "classes.csv"
)


# =========================================================
# 3. Load Class Names and Categories
# =========================================================

class_names = []
class_categories = {}

with open(
    CLASSES_FILE,
    "r",
    encoding="utf-8"
) as file:

    reader = csv.DictReader(file)

    for row in reader:

        class_id = int(
            row["Class ID (int)"]
        )

        class_name = row[
            "Class Name (str)"
        ]

        category = row[
            "Coarse Class Name (str)"
        ]

        class_names.append(class_name)

        class_categories[class_id] = category


print(
    "Number of classes:",
    len(class_names)
)


# =========================================================
# 4. Load ResNet18 Architecture
# =========================================================

model = models.resnet18(
    weights=None
)


# Replace final layer
# with 81 grocery classes

model.fc = nn.Linear(
    model.fc.in_features,
    len(class_names)
)


# =========================================================
# 5. Load Trained Model
# =========================================================

model.load_state_dict(
    torch.load(
        MODEL_PATH,
        map_location=device
    )
)

model = model.to(device)

model.eval()


# =========================================================
# 6. Image Preprocessing
# =========================================================

preprocess = transforms.Compose([

    transforms.Resize(
        (224, 224)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[
            0.485,
            0.456,
            0.406
        ],

        std=[
            0.229,
            0.224,
            0.225
        ]
    )
])


# =========================================================
# 7. Product Recognition Function
# =========================================================

def recognize_product(image_path):

    # Open image
    image = Image.open(
        image_path
    ).convert("RGB")


    # Preprocess image
    input_tensor = preprocess(
        image
    ).unsqueeze(0)


    input_tensor = input_tensor.to(
        device
    )


    # Run prediction
    with torch.no_grad():

        output = model(
            input_tensor
        )


    # Convert output to probabilities
    probabilities = torch.nn.functional.softmax(
        output[0],
        dim=0
    )


    # Get highest probability
    confidence, class_id = torch.max(
        probabilities,
        dim=0
    )


    predicted_class_id = (
        class_id.item()
    )


    # Get product name
    predicted_product = class_names[
        predicted_class_id
    ]


    # Get grocery category
    predicted_category = class_categories.get(
        predicted_class_id,
        "Unknown"
    )


    return (
        predicted_product,
        predicted_category,
        confidence.item()
    )


# =========================================================
# 8. Test Product Image
# =========================================================

TEST_IMAGE = (
    r"C:\Users\Vamsi\OneDrive\Desktop"
    r"\SMARTCART-AI\ml\dl\test_product.jpg"
)


# =========================================================
# 9. Run Prediction
# =========================================================

print(
    "\nProduct Image Recognition "
    "Model Loaded Successfully"
)


result, category, confidence = recognize_product(
    TEST_IMAGE
)


# =========================================================
# 10. Display Result
# =========================================================

print(
    "Predicted Product:",
    result
)

print(
    "Category:",
    category
)

print(
    "Confidence:",
    round(
        confidence * 100,
        2
    ),
    "%"
)