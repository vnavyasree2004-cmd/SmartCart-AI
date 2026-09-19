import os
import torch
import torch.nn as nn
import torch.optim as optim

from PIL import Image
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, models
from torchvision.models import ResNet18_Weights


# =========================================================
# 1. Device
# =========================================================

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Using device:", device)


# =========================================================
# 2. Dataset Path
# =========================================================

DATASET_PATH = r"C:\Users\Vamsi\Downloads\GroceryStoreDataset-master\GroceryStoreDataset-master\dataset"

TRAIN_FILE = os.path.join(DATASET_PATH, "train.txt")
VAL_FILE = os.path.join(DATASET_PATH, "val.txt")


# =========================================================
# 3. Custom Grocery Dataset
# =========================================================

class GroceryDataset(Dataset):

    def __init__(self, annotation_file, transform=None):

        self.transform = transform
        self.samples = []

        with open(annotation_file, "r") as file:

            for line in file:

                line = line.strip()

                if not line:
                    continue

                image_path, fine_label, coarse_label = line.split(",")

                image_path = image_path.strip()
                fine_label = int(fine_label.strip())

                full_path = os.path.join(
                    DATASET_PATH,
                    image_path.replace("/", os.sep)
                )

                self.samples.append(
                    (full_path, fine_label)
                )


    def __len__(self):
        return len(self.samples)


    def __getitem__(self, index):

        image_path, label = self.samples[index]

        image = Image.open(image_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, label


# =========================================================
# 4. Image Transformations
# =========================================================

train_transform = transforms.Compose([

    transforms.Resize((224, 224)),

    transforms.RandomHorizontalFlip(),

    transforms.RandomRotation(10),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


val_transform = transforms.Compose([

    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# =========================================================
# 5. Load Training and Validation Dataset
# =========================================================

train_dataset = GroceryDataset(
    TRAIN_FILE,
    transform=train_transform
)

val_dataset = GroceryDataset(
    VAL_FILE,
    transform=val_transform
)


print("Training images:", len(train_dataset))
print("Validation images:", len(val_dataset))


# =========================================================
# 6. Data Loaders
# =========================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=16,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=16,
    shuffle=False,
    num_workers=0
)


# =========================================================
# 7. Load Pretrained ResNet18
# =========================================================

weights = ResNet18_Weights.DEFAULT

model = models.resnet18(weights=weights)


# =========================================================
# 8. Replace Final Layer
# =========================================================

num_classes = 81

model.fc = nn.Linear(
    model.fc.in_features,
    num_classes
)


model = model.to(device)


# =========================================================
# 9. Loss Function and Optimizer
# =========================================================

criterion = nn.CrossEntropyLoss()

optimizer = optim.Adam(
    model.parameters(),
    lr=0.0001
)


# =========================================================
# 10. Training
# =========================================================

num_epochs = 5

print("\nStarting training...\n")


for epoch in range(num_epochs):

    model.train()

    running_loss = 0.0

    correct = 0

    total = 0


    for images, labels in train_loader:

        images = images.to(device)

        labels = labels.to(device)


        optimizer.zero_grad()


        outputs = model(images)


        loss = criterion(
            outputs,
            labels
        )


        loss.backward()

        optimizer.step()


        running_loss += loss.item()


        _, predicted = torch.max(
            outputs,
            1
        )


        total += labels.size(0)

        correct += (
            predicted == labels
        ).sum().item()


    train_accuracy = (
        100 * correct / total
    )


    # =====================================================
    # Validation
    # =====================================================

    model.eval()

    val_correct = 0

    val_total = 0


    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(device)

            labels = labels.to(device)


            outputs = model(images)


            _, predicted = torch.max(
                outputs,
                1
            )


            val_total += labels.size(0)

            val_correct += (
                predicted == labels
            ).sum().item()


    val_accuracy = (
        100 * val_correct / val_total
    )


    print(
        f"Epoch [{epoch + 1}/{num_epochs}] "
        f"Loss: {running_loss / len(train_loader):.4f} "
        f"Train Accuracy: {train_accuracy:.2f}% "
        f"Val Accuracy: {val_accuracy:.2f}%"
    )


# =========================================================
# 11. Save Trained Model
# =========================================================

MODEL_PATH = os.path.join(
    DATASET_PATH,
    "grocery_resnet18.pth"
)

torch.save(
    model.state_dict(),
    MODEL_PATH
)


print("\nTraining completed successfully!")

print(
    "Model saved at:",
    MODEL_PATH
)