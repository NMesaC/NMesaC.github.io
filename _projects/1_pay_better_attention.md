---
layout: page
title: '"You Need to Pay Better Attention" Paper Discussion'
img: assets/img/project_2_thumbnail.png
importance: 1
category: work
related_publications: false
---
<style>
/* Base styling */
body {
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}

/* Headings */
h1, h2, h3 {
  font-weight: 700;
}
h1 { color: #0055aa; }
h2 { color: #0077cc; }
h3 { color: #3399ff; }

/* Links */
a {
  color: #0066cc;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

/* Inline code */
code {
  background: rgba(27, 31, 35, 0.05);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: ui-monospace, monospace;
}

/* Code blocks */
pre {
  background: rgba(27, 31, 35, 0.05);
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
}

/* Callouts */
blockquote {
  border-left: 4px solid #ccc;
  padding-left: 1em;
  color: #555;
  font-style: italic;
}
</style>


### TL;DR
The paper focuses on combining and adding new weight matrices in the Attention Mechanism to produce more efficient and performant models for the IMDb test set. We see favorable reimplementation results, and discuss study limitations.

# Introduction
When I took my Introduction to Machine Learning Class at CMU (10-701) in my Junior year, we discussed briefly the Transformer Architecture. We learned about the inutition and mathematics behind Scaled Dot Product Attention (SDPA), which is the standard attention implementation used in Transformer models. However, standard SDPA is not necessarily the most efficient nor most performant attention mechanism that can be used. This paper presents alternate attention implementations that are both more efficient and performant than standard SDPA. Here, I present the results of my reimplementation. A summary of the paper can be found in my blog.

# Reimplementation Results

## Results Comparison

The paper itself experimented on Vision Transformers and Transformer-Encoder only architectures, by testing on datasets like MNIST, CIFAR100, and IMDB respectively. I decided to focus my efforts on the IMDB sentiment analysis task, since I was already quite familiar with it from my class, and I wanted to focus more on working with the new attention layers. I wrote two versions of the MultiHeadAttention class, one in Keras and one in pure PyTorch. I did this since the original authors said that they used Keras examples as their basis and then proceeded to add their AttentionLayers by changing the MultiHeadAttention module. To see if I could replicate their work, I reimplemented the Attention Layers in Keras. 

<div style="text-align:center">
  {% include figure.liquid
      path="/assets/img/attention_images/figure_2.jpg"
      width="600px"
      class="z-depth-1"
  %}
</div>


Figure 2. Results of Attention Layer Reimplementation on IMDB dataset using a T4 GPU in Keras (Me)

<div style="text-align:center">
  {% include figure.liquid
      path="/assets/img/attention_images/figure_3.jpg"
      width="600px"
      class="z-depth-1"
  %}
</div>

Figure 3. Paper’s Results on IMDB dataset using A100 GPU or RTX 4090 GPU in Keras (Paper)

As we can see, the results of my reimplementation closely mirror those that the paper produces. The number of parameters is the same as what the paper reports. Furthermore, the training accuracies have similar trends, being in the same range as what the paper reports. This holds for the training and test loss as well. A point of interest is that in my run, we see the Efficient layer perform similarly to the Super layer in terms of test accuracy. This indicates that the performance of the Efficient Layer can be similar to that of the Super layer in general. I will note however that in collecting data from my experiments, the peak performance of the Super layer was always greater than that of the Efficient Layer. These results show the correctness of the reimplementation, and ultimately verify that the Keras implementation I produced works as expected.

<div style="text-align:center">
  {% include figure.liquid
      path="/assets/img/attention_images/figure_4.jpg"
      width="600px"
      class="z-depth-1"
  %}
</div>

Figure 4. Results of Attention Layer Reimplementation on IMDB dataset using a T4 GPU in PyTorch (Me)

I also ran the same IMDB Sentiment Analysis with my PyTorch implementation of the novel Attention Layers. As we can see, there are some noteworthy differences between the Keras and PyTorch implementations. The most glaring difference is that, despite the same number of attention parameters, the model size in MB is far lower. I used the same function to find the size of both the PyTorch and Keras files and saved the models in the same file format to get these numbers. Even after trying to save the Keras model as a ‘.keras’ file, the sizes remain relatively unchanged. I suspect that Keras has more overhead when serializing the models, and since Keras is a “higher level framework” than PyTorch as well, this lines up and would explain the size difference. However, since we see the same number of parameters, it’s clear the Attention Layers are the same between both frameworks.

We can observe an interesting difference in the training accuracies the paper reports and my results. We see that the training accuracies are in a similar range to that of the paper, but still a few percentage points below what the paper reports. Furthermore, the trend is not replicated, since Super has the lowest training accuracy and Optimized has the highest training accuracy. From my own testing and observations, this is most likely due to differences in the training data. I elaborate on this difference in the Takeaways section.

The loss values are not interesting metrics to discuss, so we instead will focus on test accuracy. We see the expected trend for the Standard, Optimized, and Efficient Layers, all of them hovering around the 72% test accuracy mark. However, the Super layer reached 74% accuracy, which more markedly shows the expected difference in between the Super layer and the other layers. I believe the Super layer didn’t reach 78% accuracy, like the paper did, due to the aforementioned differences. However, the trend that the Super layer is outperforming the other layers indicates to me that if the dataloaders were equal, this PyTorch implementation would be equivalent to the Keras implementation, thereby showing its effectiveness and correctness.

## Further Notes on the Super Layer
In the original paper, the authors use a single, shared weight matrix, W_a, that is managed by the MultiHeadAttention module and learns a type of “mixing” transformation between the keys and values for the Super Attention layer that should improve performance. I used this version of the Super Layer to run my experiments. From here on, I will refer to it as the “Shared Super Layer.” The authors noted that there may be some performance benefits in giving each Attention Layer it’s own W_a matrix to learn a transformation between the Keys and Values. I will refer to this one as the “Individual Super Layer.” I also implemented this version of the Super Attention layer and made it available, but I had some notes on it regarding my experiments.

From my experiments with the Individual Super Layer, it on average performs worse than the Shared Super Layer. This is easy to verify with the uploaded notebooks on the GitHub page. I hypothesize that this is because the Shared Super layer has a single W_a matrix that is updated more frequently via backpropagation compared to the individual W_a matrices in the Individual Super Layers. For h heads of a MultiHeadAttention layer, the single W_a matrix from the Shared Implementation should experience h times more backpropagation updates. This makes sense since every time we perform backpropagation after processing a batch of inputs, we have to do a backwards pass through the entire model. When we use the Shared Super Layer, we do a backwards pass h many times through that matrix since it is utilized in h separate Attention Layers. When we use the Individual Super Layer, each time we perform a backwards pass, we update a separate W_a matrix for each attention layer. This naturally will result in W_a matrices that have had less updates and have therefore been less optimized. As a result, the Shared Super Layer performs better than the Individual Super Layer, and provides the performance boosts we expect.

I want to note that I do not believe the Individual Super Layer architecture is redundant, though. I believe there are ways to remedy this. Decreasing the batch size will increase training time, but will result in more backwards passes overall across the epochs. However, this may cause overfittings more quickly, so there are alternatives. Having a higher probability for the dropout layers of the models could work. If the entire model learns at a slower rate, and then the individual matrices are “exempt” from the dropout probability, with sufficient training, they may learn the proper mixing transformation. Another possibility could be to have a separate learning rate schedule for each of the individual W_a matrices in each Attention Layer. One would need to design a wrapper around the existing Optimizers in frameworks like Keras or PyTorch and this may cause inefficiencies in training time, but it is an idea nonetheless.

# Study Limitations
The performed study is limited in various ways, so I will detail them here. With respect to the paper, my study replication is limited since the T4 GPU I had access to was the free tier of GPU that Google Colab provides. Since the GPU’s were on Google Colab, I was unable to get reliable timing data. Even the median run time was not yielding results that made sense for the implementations. I decided to omit this part of the study recreation namely because, under properly controlled circumstances with a GPU, it should be quite straightforward to recreate those results.

For both my recreation study and the original paper, a key limitation needs to be mentioned. Neither myself nor the authors have the resources to test how the different attention types would affect training and performance for a model like BERT, which is where real time and energy gains could be made by using alternatives such as the Efficient Attention Layer. Furthermore, we cannot see the effect of performance on such a large model using the Super layer, which is another limitation.

# Takeaways
This was my first paper reimplementation, and honestly, my first major ML project outside of classes. As a result, I learned quite a bit that will serve me as I pursue more projects.

## CPU vs GPU Performance and Timing
When running the experiments, I occasionally was not able to access a Google Colab GPU due to limitations the service has. As a result, I decided to try and run everything locally on a Macbook Air with an Apple M2 CPU. Once I had access to a GPU again, I realized why this was a mistake. I understand that CPU’s are general purpose processors and are not optimized for performing batch processing or Matrix Multiplication. Despite this, I heard the Apple M2 was good at performing ML tasks, so I wanted to see if this was true, or at least what performance would look like on the Apple M2. While I was able to collect data, it was not helpful. The main piece of data I was interested in was timing data, since it was inconsistent on the GPU I had access to. However, I was not able to replicate timing differences or trends on the CPU. This probably due to the aforementioned lack of optimization, so the differences in timing a GPU should reveal are not seen. My takeaway is to focus on GPU data and usage as opposed to CPU usage in further experiments, and simply gaining access to a more reliable GPU for future experiments.

## The Keras and PyTorch Differences
As I mentioned above, my Keras and PyTorch implementations have different results, but similar trends. I spent a long time trying to debug this to no avail, but I was able to realize at the end why this occurred. The dataloader between Keras and PyTorch are different. The Keras dataloader differs from the way the PyTorch one does in the amount of data loaded in and what data is loaded in. The PyTorch dataloader I used loaded in the data from a raw “IMDB_data.csv” file, whereas the Keras dataloader downloaded a “.npz” file specific to the Keras dataloader library. From the small bit I was able to gather about it, it seems to load a subset of the IMDB dataset for training, and I wasn’t able to replicate its functionality for the PyTorch implementation. Despite this, the PyTorch implementation shows similar trends on the test data, so I left the dataloader the way it is. This entire experience taught me that I need to check the code first for any obvious bugs, but then the data and the dataloader should be the next thing to inspect. A core part of Machine Learning is the quality of data, and though I knew this, I learned more so first hand about this fact here.

## Test Benches
When I originally wrote my test bench, I was not able to recreate the paper’s results, and I was unsure as to why. I reached out to the authors after much testing, and found out what the key differences were. The main difference was that the authors tracked validation accuracy, and only saved the best performing model on validation accuracy after 10 epochs. This makes sense, but I did not think of it since I never did it in class, so learning about this practice was quite insightful and helpful, and I am extremely grateful to the authors for taking the time to answer my questions.

# Conclusion
All in all, I’d say this Paper Reimplementation has been highly successful. I was able to recreate the results in Keras and able to recreate the trends in PyTorch. I was able to learn more about the process of reimplementing a paper and setting up experiment benches, which while I did in my ML classes at CMU, having less direction and more freedom in doing so has helped me learn more about the process. I hope this discussion and the associated code helps anyone else interested in the Paper or its results!

# Acknowledgements
I would like to thank Seyedpeyman Hosseini and Mehran Hosseini, the original paper authors, for being so kind as to assist me in figuring out how to actually replicate the results of their test bench and in general some questions about architecture differences. They were generous enough to help point out the differences in my test bench, data collection approach and hyperparameters, and I greatly appreciate their time and assistance. This paper replication would not be possible with out their help, and I greatly appreciate it.

# Procedures
Full details of the code I wrote to generate results are available at <a href="https://github.com/NMesaC/pay-better-attention-pytorch-keras"> my github! </a>



