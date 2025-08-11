---
layout: post
title: "How are Cross Attention and Cross Modal Projection Layers Related in Vision-Language Models?"
giscus_comments: false
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

# Motivation
In my research into Vision-Language Models, I had a simple question I had not seen answered before: "Are Cross Attention and Cross Modal Projection Layers equivalent? If not, how are they related?" After doing a bit of light math and reasoning, I have come to believe the answer is: "LLaVA's Score Matrix computation is a superset of Cross Attention's. The attention weights for both mechanism have similar interpretations, but LLaVA uses a slightly different computation that has notable consequences". Here, I will take the time to describe the background behind cross-modality interactions, the proof sketch for why this is true, and some takeaways and conclusions that can be drawn.

# Background

## Cross Attention Revisited
Let us assume that our image input of shape $h \times w$ has been encoded into a vector of shape $X_i \in \mathbb{R}^{n \times d_i}$, where $d_i$ is the embedding dimension for the image. We also assume our text of length $m$ is tokenized and then turned into an embedding of shape $X_t \in \mathbb{R}^{m \times d_t}$, where $d_t$ is the embedding dimension for the text. Usually, we have $n < hw$ since we are encoding our image, but we could also perform this with raw pixels, where $n = hw$. Cross Attention then has a simple inductive bias. We will use our input image to form our queries, and our text input to form our keys and values. Then, our computation follows closely to that of Standard Dot Product Attention.

$$
\begin{alignat}{2}
&Q = X_iW_q \in \mathbb{R}^{n \times d} &&\text{Queries}\\
&K = X_tW_k \in \mathbb{R}^{m \times d} &&\text{Keys}\\
&V = X_tW_v \in \mathbb{R}^{m \times d} &&\text{Values}\\
&S = QK^T / \sqrt{d} \in \mathbb{R}^{n \times m} &&\text{Scores}\\
&A = \text{softmax}(S) \in \mathbb{R}^{n \times m} &&\text{Attention Weights}\\
&O = AV \in \mathbb{R}^{n \times d} &&\text{Output}\\
\end{alignat}
$$

The result is that the attention weights represent a probability distribution of each encoded pixel over the prompt tokens. This means that, given an encoded pixel, we can find which token has the highest probability of being related to the given encoded pixel. This is a nice interpretation of the attention weights, since then it means that the output of Cross Attention is simply a weighted average (specifically: a Convex Combination due to the softmax operation) of the vectors of the value matrix. In total, this means each pixel tells us how much the pixel should attend to a given text token, and then uses this probability distribution to weigh the importance of all the text tokens that make up the value matrix.

## Cross Modal Projection Layers (LLaVA)
We assume again our text of length $m$ has been tokenized and then turned into an embedding of shape $X_t \in \mathbb{R}^{m \times d_t}$. Now, we assume our image input has been encoded into a vector of shape $X_i \in \mathbb{R}^{n \times d_i}$. The idea behind Cross Modal Projection Layers is that instead of learning $W_q$ that is specific to the image modality, we can instead convert our image embeddings to have the same feature dimension as our text embeddings, and then pass the transformed image embeddings into an LLM alongside our text embeddings. This is achieved by learning a projection layer $W: \mathbb{R}^{n \times d_i} \mapsto \mathbb{R}^{n \times d_t}$. This method is based on the observation from LiMBeR [1] that the output embedding space of vision models is similar enough to the input embedding space that only a linear projection is needed to transform vision embeddings to language embeddings when working with LLMs. Once the image embedding is produced from the vision model, it is typically prepended to the text embedding, alongside some [IMG] token or embedding to indicate to the LLM when an image is being processed. The rest of the LLM pipeline proceeds as normal.

## Empirical Considerations
An important note is that these methods are quite similar theoretically. However, when we consider implementing these multimodal methods, we come across some important considerations. When working with Cross Modal Projection Layers, we can use various pre-trained vision models and LLMs, and we ONLY have to learn the projection layer. This means we have to learn a cheap projection layer and we can keep expensive components frozen. When using cross attention, however, we have to learn the query matrix $W_q$. This would actually be equivalent if we only had 1 attention module, but recall that modern LLMs use multi-headed attention and usually are comprised of multiple transformer blocks, usually around 32 blocks. Even if we assume a conservative 4 heads used in Multi-Headed attention, we would have to relearn $4 \times 32 = 128$ query matrices! It should be noted that these $W_q$ are not trivially small, since $d = 4096$ is a common embedding dimension seen in these models training. This means we would see $4096 \times n \times 128 = 524288n$ parameters updated for some image embedding length $n$. Though $n$ can be small depending on the vision model used, other Transformer based Vision Models may produce sequences of length $14 \times 14 = 196$, which would balloon the number of parameters that need to be learned further! Furthermore, it would require having a fixed image encoder beforehand, which is less than ideal.

## Guiding Question
With this in mind, the natural question that arises is: "Are these methods equivalent?" If these methods are equivalent, or at least similar, why would we use Cross Attention over Cross Modal Projection Layers?

# Analysis

## Main Proof 1: Computing Score Matrices
We will use $;$ to represent vertical concatenation. We will also assume that $W_q$ and $W_k$ does NOT split across modality lines, meaning that our image and text embeddings are sufficiently similar so this does not happen. Furthermore, we will only be considering the first attention layer for clarity and succinctness. Finally, we will refer to pixels, not patches. We address these assumptions further in the Appendix.

Firstly, let us focus on what LLaVA is computing in the first attention layer, as the equivalence to Cross-Attention will be readily visible from there. Assume we compute $H_i = W \cdot g(X_i) \in \mathbb{R}^{n \times d}$, where $g$ is our visual encoder and $W$ is our learned projection matrix. Further assume we have computed the text embedding $X_t \in \mathbb{R}^{m \times d}$, where $d$ is the embedding dimension of our LLM. We then construct our input $X_{tot} = [H_i \ ; \ X_t]$. This means that $X_{tot} \in \mathbb{R}^{(n+m) \times d}$. 

As above, we assume that $W_q$ and $W_k$ do not decompose across modality lines. Our resultant computation then gives us:

$$
\begin{alignat}{2}
&Q = X_{tot}W_q = [X_i \ ; \ X_t ]W_q = [ X_iW_q \ ; \ X_tW_q] \in \mathbb{R}^{(n+m) \times d}&&\text{Queries}\\
&K = X_{tot}W_k = [X_i \ ; \ X_t ]W_k = [ X_iW_k \ ; \ X_tW_k] \in \mathbb{R}^{(n+m) \times d}&&\text{Keys}\\
\end{alignat}
$$

To make the following section as clear as possible, assume $W_q = W_k = I_{d \times d}$. Also, we omit the scaling factors.  The following results can be quite easily recovered without these assumptions, but this will allow for clarity and brevity.

We will now compute the score matrix and get the following result:

$$
\begin{alignat}{2}
&S = QK^T = [ X_i \ ; \ X_t] @ [ X_i \ ; \ X_t]^T = [ X_i \ ; \ X_t] @ [ X_i^T \ | \ X_t^T] = \begin{bmatrix} X_i X_i^T & X_i X_t^T \\ X_t X_i^T & X_t X_t^T \end{bmatrix} \in \mathbb{R}^{(n+m) \times (n+m)} \\
\end{alignat}
$$

Now, we will focus on what Cross Attention is computing in the first attention layer. If we assume that $W_q = W_k = I_{d \times d}$ for Cross Attention, as we did with LLaVA above, we get the following:

$$
\begin{alignat}{2}
&Q = X_iW_q = X_i \in \mathbb{R}^{n \times d} &&\text{Queries}\\
&K = X_tW_k = X_t \in \mathbb{R}^{m \times d} &&\text{Keys}\\
&S = QK^T = X_iX_t^T \in \mathbb{R}^{n \times m} && \text{Scores}\\
\end{alignat}
$$

We can see that LLaVA actually already computes the score matrix of Cross Attention! The top right block matrix computed by LLaVA is identical to what Cross Attention computes for its score matrix. The top left and bottom right block matrices correspond to image embedding self attention score matrices and text embedding self attention score matrices respectively. Finally, the bottom left block matrix represents cross attention, but with text as the query and images as the keys. 

## Main Proof 2: The Softmax Operation
In the past section, I have only been focusing on the resultant score matrices. We can clearly see for both computations that, independent of the scaling factor, we have not performed the softmax operation to turn our scores into a probability distribution. Thus, we arrive at an interesting point in this discussion and investigation.

**Although LLaVA computes the cross attention score matrix alongside other matrices, the softmax operation means that the attention results from both processes must be different!**

The first question that we can ask from this is clear: What are the implications of this fact? Well, we see that cross attention has a clear interpretation. Cross Attention weights represent a probability distribution of each encoded pixel over the prompt tokens. This means that, given an encoded pixel, we can find which token has the highest probability of being related to the given encoded pixel. 

The computation LLaVA performs has a similar interpretation, but has caveats associated with it. WLOG, assume we look at the first row of the resultant block matrix. The argument would be roughly the same if we look at any row of the vertically concatenated input, whether it was the image or text input, and all that would change is indexing details. We see that for this first row, we are computing a probability distribution of each encoded pixel over both the other encoded pixels AND the prompt tokens. This is represented as $X_i[1:] @ [X_i \ ; \ X_t]^T$.

## Main Proof 3: LLaVA Interpretation and Implications
We now have a full understanding of what Cross Attention and LLaVA are computing for their attention computations, under some assumptions. We take the time to note here that, if we remove the assumptions that $W_q = W_k = I_{d \times d}$, we still get the same result if we make the weaker assumption that both Cross Attention and LLaVA will use the same $W_q$ and $W_k$ matrices. 

We then see that LLaVA is computing a probability distribution of pixels over the other encoded pixels AND the prompt tokens for the top block matrices. The bottom block matrices are computing a probability distribution of prompt tokens over encoded pixels AND the prompt tokens. We can interpret this as LLaVA doing an "all in one" computation. Whereas some models like FLAMINGO [3] alternate between Cross Attention and Self Attention, LLaVA is simply computing which pixel or token is attended to the most by a given pixel or token. 

This interpretation has its pros and cons. We see that by treating both the pixels and tokens as queries and keys, we are able to effectively ask the questions "What information does this (pixel/token) need?" and "What information does this (pixel/token) provide?" when performing our attention computation. Compare this to Cross Attention, which only asks "What does this pixel need from the tokens?" since pixels are only used to form queries in Cross Attention. A consequence of this is that, compared to Cross Attention, we are potentially getting more information with our computation. By seeing how pixels attend to other pixels alongside text tokens (and the same done for text tokens), this may allow VLMs to get a better context for the text + image pair, and ultimately have the models perform better overall!

Another consequence is that some may argue that the signal present in the Cross Attention computation might be diluted when performing LLaVA's computation, since instead of only considering 1 pixel with the prompt tokens, we are considering 1 pixel with all the other pixels (including itself) and the prompt tokens, meaning that probability mass is spread out over more pixels/tokens compared to Cross Attention. Unlike the last point made, this argues that the extra computation performed will unnecessarily attenuate our signal, not provide extra context for the model to perform better. This is a valid concern, as by performing attention with large sequence lengths, independent of multimodal considerations, the signal will necessarily be diluted. Despite this concern, we see that LLaVA tends to outperform FLAMINGO! We see that FLAMINGO only achieves a 23.3 on MMVet [4], a popular benchmark for evaluating multimodal models, wheras the 2023 evaluation of LLaVA receives a 28.3 on MMVet for similar parameter counts (roughly 7B)[5]. 

These results are ultimately contradictory. On one hand, we believe that LLaVA's computation should give the model more information, by allowing pixels to attend to other pixels, and ultimately lead to better performance, which is what we see empirically. However, theoretically, this should not happen, and instead the signal that Cross Attention provides should be diluted out by all the pixels/tokens, meaning a sparser distribution of probability mass. So what is really going on? The issue is actually confounded by multiple variables. LLaVA's performance over FLAMINGO cannot be solely attributed to architectural differences, and the notion that "our theoretical worries were unfounded in reality". LLaVA was released in 2023, with access the better open source Language Models and Vision Encoders compared to what FLAMINGO had in 2022. Furthermore, recent VLMs have continuted the cost effective trend that LLaVA set with its architecture. This coupled with better data and other procedural improvements means that comparing FLAMINGO to LLaVA and current VLMs is like comparing apples to oranges. As a result, we have our own version of a signal versus noise problem: Do current models perform better because the LLaVA projection architecture is better, or do current models perform better because we have gotten better data and larger scales? Ultimately, we cannot know without more experimentation and research.

# Conclusions

## Summary
In this blog post, we discussed Cross Attention and LLaVA Projection, the empirical reason why LLaVA's architecture is more appealing, an analysis of how Cross Attention and LLaVA Projection are similar, and why we do not really know whether cross attention or LLaVA Projection are better.

## Future Work
Based on the results and ideas discussed here, there are a couple points for future work.

1. We should experiment to see if image and text embeddings cluster in the way we assume they should. If they overlap as we expect them to (eg. Black Cat maps to an image of a black cat, or at least is quite similar), then our original belief that $W$ does not decompose across modality lines is justified. If not, we can revisit that assumption, and see if we can force these embeddings to map closer to one another.

2. We can try to investigate if the extra computation LLaVA performs compared to Cross Attention is a truly valuable signal or if it is noise that has been overfitted to. We can 0 out different parts of the resultant block matrix at various points of the inference pipeline, and see how that affects results. If the model fails, is it failing because it needs the "noise", or is there something else going on under the hood? How can we use this to compress LLaVA and make it more efficient?

3. We could investigate improving the image encoder. Though I did not discuss it here, we know that Language Supervised Vision Encoders outperform normal Vision Encoders by large margins. What sort of gains compared to LLaVA can we get if we improve this stage of the pipeline? Will this ultimately affect or address the signal and noise issues we had here?

# Appendix

## A: Issues with Multimodal Training
As seen in various works regarding training Multimodal Networks [2], different modalities contribute to the loss different amounts, independent of whether or not we pre-process them. Consider a small model that takes in images and a binary label. The model fuses these modalities by concatenating the label to the end of the image, and processing that with a single $W$ matrix. We can see that if we use raw image pixels, the image will contribute far more to the loss than the binary label since the image deals with values from [0,255] and 3 channels per pixel, compared to a single binary value. Furthermore, even if we consider normalizing the image to be within [0,1], pixel values will not be uniformly distributed across images, meaning dark patches in images will contribute far more to the loss than light image patches! 

This is originally was a relevant point, but I will take the time to discuss why it actually is not necessary, as it is quite interesting. When I originally began writing this post and reasoning about this situation, I believed that the weight matrix would decompose across modality lines for both the queries and keys in LLaVA. However, upon further inspection, since our image embeddings our projected into the input space of the LLM (as per LiMBeR), we would need more experimental data (saved for future work) to show that the image embeddings and text embeddings cluster seperately, or would have reason to split across modality lines. 

## B: What about the whole Transformer?
We effectively only concerned ourselves with the first attention layer, and ignored the entire Transformer. Why did we do this? Realistically, it is for simplicities sake. Implicitly, we believe that the most important parts of the VLM we need to investigate is the Vision Encoder and the Attention Mechanism. Ideally, we think that these are the blocks that, if improved, will lead to better performance overall. The rest of the Transformer architecture consists of a FFNN, which is used to process our feature representations to pass to later blocks to learn new, more abstract feature representations. Ultimately, we should not disregard the rest of the Transformer Architecture, but turning our main focus onto the Attention Mechanism focuses the article and simplifies the proof. In the future, tweaking and understanding these FFNN's alongside Attention and the Vision Encoder may be beneficial as well!

## C: Pixels versus Patches
Modern Vision Encoders do patch wise encodings, compared to pixel based encodings. My knowledge of Cross Attention comes mainly from the Latent Diffusion Model literature, where images are compressed into encoded pixels. However, converting pixels into patches for this argument is relatively trivial.

---

## References

[1] Merullo, J., Castricato, L., Eickhoff, C., & Pavlick, E. (2023). Linearly Mapping from Image to Text Space. arXiv preprint arXiv:2209.15162.

[2] Wang, W., Tran, D., & Feiszli, M. (2020). What Makes Training Multi-Modal Classification Networks Hard? arXiv preprint arXiv:1905.12681.

[3] Alayrac, J. B., Donahue, J., Luc, P., Miech, A., Barr, I., Hasson, Y., ... & Simonyan, K. (2022). Flamingo: a visual language model for few-shot learning. Advances in Neural Information Processing Systems, 35, 23716-23736.

[4] Yu, W., Yang, Z., Li, L., Wang, J., Lin, K., Liu, Z., Wang, X., & Wang, L. (2024). MM-Vet: Evaluating Large Multimodal Models for Integrated Capabilities. arXiv preprint arXiv:2308.02490.

[5] OpenCompass. (2025). Open VLM Leaderboard. Hugging Face Spaces. https://huggingface.co/spaces/opencompass/open_vlm_leaderboard

<!-- # TODO: Insert image

## Aside 2: SoTA Models
We've reached the "So what?" point of this proof. Rightfully so, many may ask "Ok, the mechanisms are different, great, but why should we care?" To remedy this, we will briefly discuss State of the Art Models, and what they do. 

Firstly, we must acknowledge that training large scale models, either Language or Vision-Language, can be extremely costly and difficult to do. This is due to the cost of using large clusters of GPU's to train, as well as the caveats associated with scaling up GPU clusters, such as more frequent hardware failures and straggling nodes. As a result, researchers and companies that are not at the same scale as OpenAI, Anthropic, or Google DeepMind, are more willing to use pre-trained components compared to renting clusters and training their own models. This informs the trend we see for SoTA models, which is to leverage the LLaVA projection architecture alongside better data, vision encoders and language models to improve performance on relevant benchmarks. From what I can find as of August 2025, the last model with high performance that used Cross Attention was FLAMINGO in 2022 from Google Deepmind. This makes sense, as if we can perform better than models that use Cross Attention with the LLaVA projection architecture, better components and data, why bother training models that utilize Cross Attention from scratch?

## Brief Notes
This proof shows that the $W_q$ that LLaVA learns <should> be capturing cross modality interactions, especially during fine-tuning, since it needs to learn how to take image->text features AND text features and project them into another space to then perform attention computation with the $W_k$ matrix, which does the same. We note that even though the image encoder output embedding space and text decoder input space are similar enough that a linear projection is enough to emprically work, we note that it shouldn't and isn't enough. We know that it performs better when the vision encoder has had text supervised training, meaning the projection is closer to being one to one, but we know that images should be more complex than just text, so they probably do not exist on the same latent space / latent plane. IF the projection is one to one, LLaVA is not learning cross modality interactions, but since the projection IS DEFINITELY NOT JUST ONE TO ONE, LLaVA is most likely learning something slightly more complex, though the extent to which this is more complex is difficult to pin point.

Furthermore, if we are trying to model these interactions further, we might want to use a shallow neural network in place of $W_k$ and $W_q$ as an alternative, as that may properly model the cross interactions better than cross attention, which simply is like LLaVA without the extra cross modality interaction step.

Another thought is that if image has intrinsic dimensionality $d_i$ and text $d_t$ s.t $d_t < d_i$, then maybe just project both up into a space $d_i < d$, tie the representations together (somehow, we learned how to do this), and then project back down into a latent space $d_embd$ to then do computations with. This may be a better / more complicated strategy that would work. Alternatively, maybe see how Flamingo, Qwen and Blip are doing things now, and use this as inspiration for better strategies.


# Experimental Design

# Analysis

## Prior Knowledge
As seen in various works regarding training Multimodal Networks [2], different modalities contribute to the loss different amounts, independent of whether or not we pre-process them. Consider a small model that takes in images and a binary label. The model fuses these modalities by concatenating the label to the end of the image, and processing that with a single $W$ matrix. We can see that if we use raw image pixels, the image will contribute far more to the loss than the binary label since the image deals with values from [0,255] and 3 channels per pixel, compared to a single binary value. Furthermore, even if we consider normalizing the image to be within [0,1], pixel values will not be uniformly distributed across images, meaning dark patches in images will contribute far more to the loss than light image patches! 

Taking this a step forward, we can consider the environment of Vision-Language Models. If we were to do simple concatenation as our fusion step, there are 2 main possibilities that can occur. One possibility of this is that the $W$ matrix we learn will overfit to only pay attention to either the image or the text, and then does not generalize well to other tasks. Another possibility is that the $W$ matrix we learn actually decomposes across modality lines, meaning we would have a weight matrix of the form $W = \begin{bmatrix} W_i & W_t \end{bmatrix}$. This second possibility has a high probability of occurring when working with Vision-Language Models, where as in our toy example, the distribution and values that images versus text embeddings may take on may not be equivalent. This means weight matrices will have parameters updating at different magnitudes and eventually will decompose across modality lines.

## Connection to LLaVA
Knowing about weight matrices decomposing across modality lines is quite relevant in analyzing what LLaVA is doing. LLaVA was trained by connecting a vision encoder to an LLM via a single projection layer, freezing the vision encoder, and learning the projection layer $W$ and fine-tuning the LLM. Couple this with the fact that LLaVA pre-pends the image embedding to the prompt, and we can see that LLaVA could plausibly be experience this decomposition across modalities.

This is a necessary, and quite reasonable, assumption to make about LLaVA and the weight matrices in the LLM it uses. With the assumption that LLaVA's weight matrices decompose across modality, we can begin our (rough) proof. 
# Takeaways -->