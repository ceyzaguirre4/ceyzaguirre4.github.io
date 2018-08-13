---
layout: post
title: Adaptive Computation Time
---

### Top-Down explanation of Graves' 2015 paper ["Adaptive Computation Time for Recurrent Neural Networks"](https://arxiv.org/abs/1603.08983)

#### 1. Motivation

Graves states "evidence that increased depth leads to more performant networks is by now inarguable, and recent results show that increased sequence length can be similarly beneficial". Easy, no? Just put your under-achieving model inside a recurrent network and have it iterate a fixed number of times (100 if you want) to observe better results. Of course, life isnt that easy. The resulting model will be much more computationaly intensive, will overfit to data easily and you probably wont even see gains in performance.

Another problem with the "iterate a fixed number of times" is finding the correct amount of times. Some works have been published where they use early-stop trainning. This method determines where the hard limit should be placed at, and is determined by increasing the number of iterations until overfitting degrades the model. This can work for some cases where all *questions* have the same complexity, because the number of iterations will be the same for all members of this set (or subset). But, what to do when elements of the same set require diferent complexity? Here making the network deeper will make it overfit to those that need less computation, but leaving the network *as is* makes it imposible to answer some of the more dificult questions.

So what we need is a way to use these increased sequence lengths when more computation is required but at the same time prevent the network from overfitting. In other words, we want to increase the sequence length when needed, but limit complexity when it isnt. How can we achieve this? By letting the network determine how many iterations it will run and including the number of iterations (or a proxy of this) in the loss function we should achieve a network that will iterate only when it helps obtain a more acurate answer.

As we push towards a recurrent network that determines how many times it will iterate a new problem arises. How will the network determine its number of iterations? And how to make this diferentiable? Having the network determine this limit *a priori* "would be equivalent to determining the Kolmogorov complexity of the data (and hence solving the halting problem)". The solution proposed by Graves is to let the network *halt* when it is ready instead.

#### 2. Halting

For each iteration the network outputs an answer and a SIGMOIDAL halting value. The magnitude of the contribution of any iteration to the answer `y_t` is equal to the sub answer (the answer given by the iteration) multiplied by its probability of being relevant to the final answer `p_n`.

<img src="http://latex.codecogs.com/gif.latex?y&space;=&space;\sum_{n=1}^{\infty}&space;p_n&space;y_n" title="y = \sum_{n=1}^{\infty} p_n y_n" />

In order to limit computation we want all probabilities to be zero for `n > N` (so that running for more iterations doesnt change the answer). 

<img src="http://latex.codecogs.com/gif.latex?p_n&space;=&space;\begin{cases}&space;R(n)&space;&\text{if&space;}&space;n&space;\geq&space;N\\&space;h_n&space;&&space;\text{otherwise}&space;\end{cases}" title="p_n = \begin{cases} R(n) &\text{if } n \geq N\\ h_n & \text{otherwise} \end{cases}" />

A function `N` is used to determine the first `n'` for which the sum of all halting probabilities is greater than one minus a small epsilon. This is so that after one iteration the sigmoidal (and therefore never quite `1`) value of `h_n` can be enough to halt if only one iteration is needed.

<img src="http://latex.codecogs.com/gif.latex?N&space;=&space;min\{&space;n'&space;:&space;\sum_{n=1}^{n'}&space;h_n&space;\geq&space;1&space;-&space;\epsilon&space;\}" title="N = min\{ n' : \sum_{n=1}^{n'} h_n \geq 1 - \epsilon \}" />

For each iteration `n` before `N` the probaility is equal to its halting value. Since the sum of all probabilities has to be equal to one (and we want to limit computation), for `n = N` `p_n` will be equal to `R = 1 - the sum of all previous probabilities`.

<img src="http://latex.codecogs.com/gif.latex?R(j)&space;=&space;1&space;-&space;\sum_{n=1}^{j-1}p_n" title="R = 1 - \sum_{n=1}^{N-1}p_n" />

This way, for any `n > N` the probaility wil be zero (`R = 1 - 1`), so we can get away with not computing them and the answer wont change, so:

<img src="http://latex.codecogs.com/gif.latex?y&space;=&space;\sum_{n=1}^{\infty}&space;p_n&space;y_n=&space;\sum_{n=1}^{N}&space;p_n&space;y_n" title="y = \sum_{n=1}^{\infty} p_n y_n" />

#### 3. Generalizing towards recurrent neural networks

In Graves' work the process described above is repeated for each element `t` in a sequence using an RNN. For each of these besides outputing `y_t` (the `y` for element `t` of the sequence) a hident state `s_t` is computed:

<img src="http://latex.codecogs.com/gif.latex?s_t&space;=&space;\sum_{n=1}^{N(t)}&space;p_t^n&space;s_t^n" title="y = \sum_{n=1}^{\infty} p_n y_n" />

Where:

<img src="http://latex.codecogs.com/gif.latex?\inline&space;p_t^n&space;&\text{&space;is&space;}&space;p_n&space;&\text{&space;in&space;timestep&space;}&space;t" title="p_t^n &\text{ is } p_n &\text{ in timestep } t" />

And `N(t)` is the first `n_t'` for which the sum of all h_t^n is greater than one minus small epsilon.

<!-- ![unrolled ACT from paper](images/ACT.png) -->

[<img src="{{ site.baseurl }}/images/ACT.png" style="width: 400px;"/>]({{ site.baseurl }}/)


<br>

In blue is the process for one element of the sequence (as described in [2.](#2.-Halting)). For each one of these elements `N(t)` iterations are performed (`n = 1` marked in red).

I havent talked about how to obtain any of the paramters mentioned (halting_values, sub_answers, sub_hidden_states) because it depends greatly on the implementation. A standard RNN (as shown in the image above) initializes its hidden state `s_t^1` (when `n = 1`) to `S(s_{t-1}, x_t)`. In other words, for the first iteration of any element in the sequence the hidden state is a function `S` aplied to the COMPLETE hidden state at timestep `t - 1` and the element of the sequence at index `t`. For any other iteration `s_t^n` is `S(s_t^{n-1}, x_t)`.

<img src="http://latex.codecogs.com/gif.latex?\inline&space;s_t^n&space;=&space;\begin{cases}&space;S(s_{t-1},&space;x_t)&space;&\text{&space;if&space;}&space;n&space;=&space;1\\&space;S(s_t^{n-1},&space;x_t)&space;&&space;\text{otherwise}&space;\end{cases}" title="s_t^n = \begin{cases} S(s_{t-1}, x_t) &\text{ if } n \eq 1\\ S(s_t^{n-1}, x_t) & \text{otherwise} \end{cases}" />

Then both `y_t^n` and `h_t^n` are calculated by feeding the hidden state `s_t^n` through feedforward layers `W_y` and `W_h` (with bias values) respectively. The output for the halting value `h_t^n` is then squashed using a Sigmoid.





```python

while True:
	print "Hello world"

```