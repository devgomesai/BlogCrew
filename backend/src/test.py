from tools import generate_cover, write_blog
from llm_service import get_llm

# respose = generate_cover.invoke({
#     "prompt": "A photorealistic image of graffiti on a brick wall. The graffiti includes a distorted version of the McDonald's golden arches and the words 'McGreed' spray-painted next to it. Urban setting, daytime.",
#     "slug": "test",
#     "name": "test"
# })

# if len(respose) != 0:
#     print(respose)

# llm = get_llm()
# print(llm.invoke("Intorduce yourself !"))

# response = write_blog.invoke({
#     "slug": "dummy-blog",
#     "content": """
# # Dummy Blog

# This is a test blog generated for testing purposes.

# ## Introduction

# Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

# ## Conclusion

# This is the end of the dummy blog.
# """
# })

# print(response)