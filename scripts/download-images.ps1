# Download Images Script for Patel Jewellers
# Usage: Run in PowerShell from repository root.
# This script downloads images from given URLs and saves them with the proper filenames.

$mapping = @(
    # About page images
    @{ Url = "https://images.pexels.com/photos/36519701/pexels-photo-36519701.jpeg?cs=srgb&dl=pexels-bharatkuiper-36519701.jpg&fm=jpg"; Out = "public/images/about/model-hero.jpg" },
    @{ Url = "https://images.pexels.com/photos/29080968/pexels-photo-29080968.jpeg?cs=srgb&dl=pexels-gursher-gill-63702010-29080968.jpg&fm=jpg"; Out = "public/images/about/model-01.jpg" },
    @{ Url = "https://images.pexels.com/photos/14836932/pexels-photo-14836932.jpeg?cs=srgb&dl=pexels-1054048-14836932.jpg&fm=jpg"; Out = "public/images/about/model-02.jpg" },
    @{ Url = "https://images.pexels.com/photos/9596225/pexels-photo-9596225.jpeg?cs=srgb&dl=pexels-tamoor-raja-105650662-9596225.jpg&fm=jpg"; Out = "public/images/about/store-model.jpg" },

    # Gallery images
    @{ Url = "https://images.pexels.com/photos/8751528/pexels-photo-8751528.jpeg?cs=srgb&dl=pexels-anastasia-shuraeva-8751528.jpg&fm=jpg"; Out = "public/images/gallery/model-01.jpg" },
    @{ Url = "https://images.pexels.com/photos/8979406/pexels-photo-8979406.jpeg?cs=srgb&dl=pexels-subir-roy-387883-8979406.jpg&fm=jpg"; Out = "public/images/gallery/model-02.jpg" },
    @{ Url = "https://images.pexels.com/photos/9157350/pexels-photo-9157350.jpeg?cs=srgb&dl=pexels-rani-sahu-9157350.jpg&fm=jpg"; Out = "public/images/gallery/model-03.jpg" },
    @{ Url = "https://images.pexels.com/photos/12696813/pexels-photo-12696813.jpeg?cs=srgb&dl=pexels-1054048-12696813.jpg&fm=jpg"; Out = "public/images/gallery/model-04.jpg" },
    @{ Url = "https://images.pexels.com/photos/10954272/pexels-photo-10954272.jpeg?cs=srgb&dl=pexels-rohan-dewangan-2844320-10954272.jpg&fm=jpg"; Out = "public/images/gallery/model-05.jpg" },
    @{ Url = "https://images.pexels.com/photos/8019787/pexels-photo-8019787.jpeg?cs=srgb&dl=pexels-shaantanu-bhatt-941724-8019787.jpg&fm=jpg"; Out = "public/images/gallery/model-06.jpg" },
    @{ Url = "https://images.pexels.com/photos/7093174/pexels-photo-7093174.jpeg?cs=srgb&dl=pexels-kagiso-mokalake-34808293-7093174.jpg&fm=jpg"; Out = "public/images/gallery/model-07.jpg" },
    @{ Url = "https://images.pexels.com/photos/36650259/pexels-photo-36650259.jpeg?cs=srgb&dl=pexels-framesbygaurav-36650259.jpg&fm=jpg"; Out = "public/images/gallery/model-08.jpg" },
    @{ Url = "https://images.pexels.com/photos/9310065/pexels-photo-9310065.jpeg?cs=srgb&dl=pexels-vickievj-9310065.jpg&fm=jpg"; Out = "public/images/gallery/model-09.jpg" },
    @{ Url = "https://images.pexels.com/photos/14089108/pexels-photo-14089108.jpeg?cs=srgb&dl=pexels-1054048-14089108.jpg&fm=jpg"; Out = "public/images/gallery/model-10.jpg" },
    @{ Url = "https://images.pexels.com/photos/9838684/pexels-photo-9838684.jpeg?cs=srgb&dl=pexels-skgphotography-9838684.jpg&fm=jpg"; Out = "public/images/gallery/model-11.jpg" },
    @{ Url = "https://images.pexels.com/photos/5814563/pexels-photo-5814563.jpeg?cs=srgb&dl=pexels-skgphotography-5814563.jpg&fm=jpg"; Out = "public/images/gallery/model-12.jpg" },
    @{ Url = "https://images.pexels.com/photos/10543122/pexels-photo-10543122.jpeg?cs=srgb&dl=pexels-innamykytas-10543122.jpg&fm=jpg"; Out = "public/images/gallery/model-13.jpg" },
    @{ Url = "https://images.pexels.com/photos/36324985/pexels-photo-36324985.jpeg?cs=srgb&dl=pexels-vika-glitter-392079-30468933.jpg&fm=jpg"; Out = "public/images/gallery/model-14.jpg" },
    @{ Url = "https://images.pexels.com/photos/10944923/pexels-photo-10944923.jpeg?cs=srgb&dl=pexels-mimfathi-10944923.jpg&fm=jpg"; Out = "public/images/gallery/model-15.jpg" },
    @{ Url = "https://images.pexels.com/photos/30661349/pexels-photo-30661349.jpeg?cs=srgb&dl=pexels-vika-glitter-392079-30661349.jpg&fm=jpg"; Out = "public/images/gallery/model-16.jpg" },
    @{ Url = "https://images.pexels.com/photos/30661345/pexels-photo-30661345.jpeg?cs=srgb&dl=pexels-vika-glitter-392079-30661345.jpg&fm=jpg"; Out = "public/images/gallery/model-17.jpg" },
    @{ Url = "https://images.pexels.com/photos/6155638/pexels-photo-6155638.jpeg?cs=srgb&dl=pexels-innamykytas-6155638.jpg&fm=jpg"; Out = "public/images/gallery/model-18.jpg" }
)

foreach ($item in $mapping) {
    $url = $item.Url
    $out = $item.Out

    if ($url -like "<PASTE_URL*>") {
        Write-Host "Skipping placeholder entry for: $out" -ForegroundColor Yellow
        continue
    }

    $dir = Split-Path $out -Parent
    if (-Not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    try {
        Write-Host "Downloading $url → $out"
        Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing
        Write-Host "Saved: $out" -ForegroundColor Green
    }
    catch {
        $err = $_.Exception.Message
        Write-Host ("Failed to download {0}: {1}" -f $url, $err) -ForegroundColor Red
    }
}

Write-Host "Done. Verify files in public/images/about and public/images/gallery"