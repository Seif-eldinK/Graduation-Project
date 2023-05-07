function dictate(input_field) {
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
        let mic_btn = $("#mic-btn");
        let final_transcript;

        let speech_recognition = new webkitSpeechRecognition();
        speech_recognition.continuous = true;  // keep recognizing until user stops the speech_recognition
        speech_recognition.interimResults = true;  // show intermediate results
        speech_recognition.lang = "en-US";  // language

        speech_recognition.onresult = function (event) {
            let intermediate_transcript = "";
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                }
                else {
                    intermediate_transcript += event.results[i][0].transcript;
                }
            }
            input_field.text(final_transcript + intermediate_transcript);
        };
        speech_recognition.onstart = () => {
            final_transcript = input_field.val();
            // check if the last character is a space
            if (final_transcript.length && final_transcript.slice(-1) !== " ") {
                final_transcript += " ";
            }

            // change the button color to red
            mic_btn.removeClass("btn-outline-secondary");  // remove css class "btn-outline-secondary"
            mic_btn.addClass("btn-danger");
        }
        speech_recognition.onend = () => {
            // change the button color back to normal
            mic_btn.removeClass("btn-danger");
            mic_btn.addClass("btn-outline-secondary");
        }
        speech_recognition.onError = (error) => {
            // change the button color back to normal
            mic_btn.removeClass("btn-danger");
            mic_btn.addClass("btn-outline-secondary");

            speech_recognition.stop();
            console.error(error);  // print error message
        }
        return speech_recognition;
    }
    else {
        console.log("Your browser does not support webkitSpeechRecognition");
    }
}
