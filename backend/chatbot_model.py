from transformers import pipeline

# Use the correct model identifier 'gpt2'
generator = pipeline('text-generation', model='gpt2')

def get_suggestions(text_input):
    response = generator(text_input, max_length=100, num_return_sequences=1)
    return response[0]['generated_text']
