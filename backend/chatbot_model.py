import openai

# Function to get suggestions from OpenAI's chat-based API
def get_suggestions(text_input):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",  # Or "gpt-4" if you have access to it
        messages=[
            {"role": "system", "content": "You are a helpful and a pro level photography assistant."},
            {"role": "user", "content": text_input},
        ]
    )
    return response['choices'][0]['message']['content']
