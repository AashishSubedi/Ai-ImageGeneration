const generateForm = document.querySelector('.generate-form');
const imageGallery = document.querySelector('.image-gallery');

const OPENAI_API_KEY = "<YOUR_API_KEY>"; // Ensure to use your valid OpenAI API Key

// Update Image Cards
const updateImageCard = (imgDataArray) => {
    imgDataArray.forEach((imgObject, index) => {
        const imgCard = imageGallery.querySelectorAll(".img-card")[index];
        if (!imgCard) return;

        const imgElement = imgCard.querySelector("img");
        const aiGeneratedImg = `data:image/jpeg;base64,${imgObject.b64_json}`;

        imgElement.src = aiGeneratedImg;

        imgElement.onload = () => {
            imgCard.classList.remove("loading");
        };

        // Handle download button click
        const downloadBtn = imgCard.querySelector(".download-btn");
        downloadBtn.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent any default behavior

            const link = document.createElement('a');
            link.href = aiGeneratedImg;
            link.download = `ai_image_${index + 1}.jpg`; // Generate a filename
            link.click(); // Trigger the download
        });
    });
};

// Generate AI Images using OpenAI API
const generateAiImages = async (userPrompt, userImgQuantity) => {
    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                prompt: userPrompt,
                n: userImgQuantity,
                size: "512x512",
                response_format: "b64_json",
            }),
        });

        // Log the full response to see what is returned from the API
        const jsonResponse = await response.json();
        console.log("Full API Response:", jsonResponse);

        // Check if data exists and is an array
        if (jsonResponse.error) {
            console.error("Error from API:", jsonResponse.error);
            return;
        }

        const { data } = jsonResponse;

        if (!Array.isArray(data)) {
            console.error('Error: Expected "data" to be an array:', data);
            return;
        }

        updateImageCard([...data]);

    } catch (error) {
        console.error("Error fetching AI images:", error);
    }
};

// Handle Form Submission
const handleFormSubmission = (e) => {
    e.preventDefault();

    const userPrompt = e.target[0].value;
    const userImgQuantity = parseInt(e.target[1].value, 10); // Ensure it's a number

    const imgCardMarkup = Array.from({ length: userImgQuantity }, () =>
        `<div class="img-card loading">
            <img src="loader.svg" alt="Loading...">
            <a href="#" class="download-btn">
                <img src="download-btn.jpg" alt="Download">
            </a>
        </div>`).join("");

    imageGallery.innerHTML = imgCardMarkup;
    generateAiImages(userPrompt, userImgQuantity);
};

// Add event listener to the form for handling submission
generateForm.addEventListener("submit", handleFormSubmission);
