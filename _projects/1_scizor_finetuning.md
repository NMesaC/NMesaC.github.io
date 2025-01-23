---
layout: page
title: Finetuning FROMAGE with Pokemon
img: assets/img/project_1_thumbnail.png
importance: 1
category: work
related_publications: false
---

## Motivation
One of the key objectives in current Machine Learning research is the desire to combine different modalities for a more unified representation concept. A model that can process and perform inference with both language and vision data will inevitably be far more powerful than what a language or vision model can do in a vacuum. This idea is called Grounding in the literature. Grounding is the idea of having a model being able to understand multiple representations of the same concept. Consider a pre-trained language model. The model might understand that an apple is a red fruit, but we want a model that can go further. We want a model that can also be able to process an image of an apple and recognize that the features of the image are the same features that, in natural language, are unique to an apple.
It is clear why such a model would be useful, as you are in essence giving a large language model “eyes”. Claude 3.5 Sonnet and ChatGPT4-o have recently been able to accomplish this. They are able to process and discuss images when prompted to. Specifically, the vision capabilities of both these models are impressive. I prompted Claude with the question “Describe this character” on the image below, Claude provided an accurate description of the image that couldn’t have been mistaken for another character.

<div style="text-align:center">
  {% include figure.liquid
      path="/assets/img/scizor_images/complete_nahobino.webp"
      width="225px"
      class="z-depth-1"
  %}
</div>

Furthermore, this model is definitely out of the scope of Claude’s training, as this image only became publicly available around early to mid June (the release date of the game the character was from), so being able to provide such an accurate natural language description of a novel image was amazing.
Once I saw these capabilities, I became interested in understanding grounding more and seeing if I could replicate the results, albeit at a much smaller scale. I had already read and summarized the paper “Grounding Language models to Images for Multimodal Inputs and Outputs” and I figured that getting more experience working with the FROMAGE framework described in the paper would be good practice. I selected to finetune FROMAGE on Pokemon because I’m a big fan of the series and also I thought that Pokemon would give me good practice describing non standard objects in natural language.

## Scope and Data
When I was scoping out this project, I originally wanted to choose a select number of the best Pokemon currently so that the model could identify them via image and then give me some information about them. However, I quickly realized upon searching that there are no robust datasets for this type of task with Pokemon. The best that exists is a kaggle dataset that contains each of the roughly 1000 Pokemon and a general description of the Pokemon. The issue is that there is only 1 image of each Pokemon, and it gives a general natural language description of each Pokemon, which is insufficient for what I wanted to do. I realized that I either would have to change what my dataset would be or I would have to make a smaller scale one for myself.
I then decided that I needed to shift scope and decided to focus on a single Pokemon and make a small training dataset for it. I decided I would use Scizor, as I feel this Pokemon has distinctive enough features that would be easy for the model to reason about.

<div style="text-align:center">
  {% include figure.liquid
      path="/assets/img/scizor_images/scizor.png"
      width="225px"
      class="z-depth-1"
  %}
</div>

To create a small dataset for this Pokemon, I need to write a web scraper, which was my first major roadblock. Google changed the way usual web scraping packages (such as Selenium) can interact with it to make queries, which lost me a lot of time trying to figure out workarounds. In the end, I just used Serpapi, which through a single API call, would perform all the requests for me. I spent a lot of time trying to come up with a general script that could be changed in the future to collect data without restriction, but I yielded so I could finish the project in a timely manner. Serpapi has a limit of 100 free API calls a month, which is more than sufficient for most use cases, so I was grateful for that at least.
Another issue was with how I needed to annotate the data. It would defeat the point of this project to just use GPT4-o or Claude API calls to generate natural language descriptions of the Scizor images, so I decided to instead label the images by hand. This took quite a bit of time, and since I did it in the Conceptual Captions (cc3m) dataset style, using natural language annotations that were diverse and still descriptive was far more difficult than anticipated.
I learned an important lesson quickly with this project, and that's how necessary good, high quality data for Machine Learning models is at this scale. I only labeled about 70 images with natural language descriptions, so I only had a small amount of data to work with. I did this since I wanted to get to work with FROMAGE as soon as possible, so I made do with what data I had, though it did impact the results later.


## Evaluation
Once I was able to get FROMAGE to actually load the model and evaluate, I encountered something I suspected might happen from the web scraping phase. The model only had limited training data to learn from, and since I did not employ any other advanced techniques to supplement cases with few examples, the model performance was mediocre on most tasks related to Scizor specifically, as it still retained its capabilities from beforehand.
The model is able to describe an image properly, but the reasoning we expect from LLM’s is not fully there with reference to Scizor. Of course, I am working on a much smaller scale than models like Claude or ChatGPT4-o, but I still expected slightly better results. I suspect that with more training data and more time, the model will be able to perform better on more complicated and less direct queries.
<div style="text-align:center">
  {% include figure.liquid
      path="/assets/img/scizor_images/fromage_out.png"
      width="600px"
      class="z-depth-1"
  %}
</div>

## Future Work

The fine tuning procedure worked in the sense that the model can actually recognize Scizor and answer basic queries, but it failed since the model cannot sustain a full conversation about Scizor as the original paper showed with a cat or a beaver as a prompt. I attribute this to the lack of data regarding Scizor in the Conceptual Captions style. I always learned in classes the necessity of good data for a Machine Learning model to actually perform effectively, but I experienced it first hand with this project.
I feel that I learned some useful skills throughout this project. Firstly, I only have access to a Macbook Air, which definitely cannot perform training fast enough for this model nor can it fit the model in its RAM. I ended up getting familiar with the LambdaLabs GPU services, setting up environments on fresh Ubuntu installs and just getting comfortable with the product, which I know will be useful later on. I also learned about web scraping and parsing data from Serpapi, which will inevitably be useful when I do later projects in Multimodal contexts. Finally, working with FROMAGE helped me work with research code and debugging it in an ML context. I have done debugging of research code and reading through github and stackoverflow posts from my internship during Summer 2023, but doing it with pytorch instead was a new experience, and I’m grateful for that.
In the future, I might revisit this project and either use an existing multimodal model to automate image captioning, expanding the existing Scizor dataset or using a different dataset all together. Regardless, I learned a lot and enjoyed working on this project, and the paper and this model have given me ideas for future projects!


## Note: Procedures
Full details of the scripts I used to prepare the demo are available at <a href="https://github.com/NMesaC/fromage_finetuning_pokemon"> my github! </a>

<div style="text-align:center">
  {% include figure.liquid
      path="/assets/img/scizor_images/scizor_end.jpg"
      width="600px"
      class="z-depth-1"
  %}
</div>
