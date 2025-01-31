import openai

def get_suggestions(text_input):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful and a pro-level photography assistant."},
            {"role": "user", "content": text_input},
        ]
    )
    return response['choices'][0]['message']['content']