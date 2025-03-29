import openai

def get_suggestions(text_input):
    # First check if the question is photography-related
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": """You are a professional photography assistant. 
            Only answer any questions related to photography."""},
            {"role": "user", "content": text_input},
        ]
    )
    return response['choices'][0]['message']['content']