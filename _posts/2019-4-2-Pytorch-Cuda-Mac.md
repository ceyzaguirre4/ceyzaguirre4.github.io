---
layout: post
mathjax: true
comments: true
title: PyTorch (1.0), CUDA & cuDNN on MacOS
---

This guide was written primarily for my own future use and the methods described have only been tested with my own late 2013 15" Macbook Pro with Nvidia 750m graphics.
Nonetheless, the guide is written in english so as to be useful for many people (although my mother tongue is spanish).
The guide is based on what was published on [this google group](https://groups.google.com/a/allenai.org/forum/#!topic/allennlp-users/uqICoCmXTjo) for AllenNLP, completing the information there and updating commands where useful.

## Prerequisites

CUDA and cuDNN are used to speed up matrix operations and other operations that are tipically useful for machine learning algorithms. 
Macs have not shipped with nVidia graphics cards since 2013 and it can be difficult to find updated drivers and cuDNN libraries that are compatible with your nVidia graphics card.

Not all graphics cards are compatible with CUDA, [here](https://developer.nvidia.com/cuda-gpus) is a list of those compatible; you need compute capability $\geq$ 3.0 in order to follow the guide.

___

#### CUDA drivers

The first step is to update your CUDA drivers.
I found [this post](https://www.insanelymac.com/forum/topic/324195-nvidia-web-driver-updates-for-macos-high-sierra-update-apr-02-2019/) where updated drivers can be found for MacOS versions up to 10.13.6 (most recent version when the post was written).
cuDNN requires driver version 378.05 or higher. While the original guide this post is based on didn´t have access to those drivers I found those listed above and can confirm they work.

___

#### CUDA toolkit

The next step is to install CUDA toolkit form [here](https://developer.nvidia.com/cuda-downloads). Select MacOS as the target OS and install the `.dmg`. This will install CUDA $\geq$ 10.1 on your local machine. Follow the onscreen prompts.

___

#### Compatible clang/Xcode version

The original post sugests installing Xcode 8.3.3 in order to get a compatible clang compiler. 
On their site nVidia says Xcode 10.1 (10B61) is compatible with MacOS 10.13.6 and CUDA 10.1. 
Personally I followed the instructions [here](https://docs.nvidia.com/cuda/cuda-installation-guide-mac-os-x/index.html) to install the older version of Xcode after having problems in a later step.
However the problems were unrelated to the clang version and although I didnt test Xcode 10.1, it can make sense to check [here](https://docs.nvidia.com/cuda/cuda-installation-guide-mac-os-x/index.html#system-requirements) for the sugested Xcode version for the downloaded CUDA toolkit.

Older Xcode versions have to be downloaded through the [Apple developer page](https://developer.apple.com/downloads).
Searching for the version number will let you download the version you want.
After downloading the version you can change the selected xcode version by running:

~~~bash
# first install command line tools (in case they weren't already)
xcode-select --install
# select the correct version; replace <Xcode_install_dir> with the real dir. 
sudo xcode-select -s /Applications/<Xcode_install_dir>/Contents/Developer
~~~

___

#### cuDNN

cuDNN can be found [here](https://developer.nvidia.com/rdp/cudnn-archive). You will need to register as a developer (for free) in order to download.
For maximum performance look for the most recent compatible version (under Dec.14); I installed [cuDNN 7.0.4](https://developer.nvidia.com/compute/machine-learning/cudnn/secure/v7.0.4/prod/9.0_20171031/cudnn-9.0-osx-x64-v7) for CUDA 9.0 (under Nov.13) since I was following the outdated tutorial.

The compressed file can be unziped and moved, I moved it to my home (so you will need to change some paths in the following instructions if you dont put it there).

I found I needed to export more paths than those on the original post. Run the following in your command line:

~~~bash
export CUDA_HOME=~/cudnn
export DYLD_LIBRARY_PATH=$CUDA_HOME/lib:$DYLD_LIBRARY_PATH
export CUDNN_LIB_DIR=$HOME/cudnn/lib
export CUDNN_INCLUDE_DIR=$HOME/cudnn/include
export LD_LIBRARY_PATH=$HOME/cudnn/lib
~~~

## Pytorch Installation

On MacOS, the only way to install pytorch with CUDA support is to install from source. The pytorch repository has [instructions](https://github.com/pytorch/pytorch#from-source), but they assume you use Anaconda. The following commands can be seen as a proven (be me) alternative:

~~~bash
# clone repository
git clone --recursive https://github.com/pytorch/pytorch
cd pytorch

# install, I use 10.13 as target because that is the version of MacOS I am running.
MACOSX_DEPLOYMENT_TARGET=10.13 CC=clang CXX=clang++ python3 setup.py install
~~~

___

#### Remove `PyTorch no longer supports this GPU because it is too old` warning


If you get this message it may be because your GPU is of CUDA compatibility 3.0 (eg. nVidia 750m). Contrary to what appears in the warning, CUDA 3.0 is supported. We can remove these warnings by going to `/usr/local/lib/python3.7/site-packages/torch/cuda/__init__.py` and commenting out lines 118-119. The location and line numbers can vary but the UserWarning raised indicated the file path and line. The commented lines in my distribution of pytorch (1.1.0) are as follows:

~~~python
# elif capability == (3, 0) or major < 3:
  # warnings.warn(old_gpu_warn % (d, name, major, capability[1]))
~~~

## Testing installation

First we test importing pytorch:

~~~python
import torch
print(torch.__version__)
~~~

We check for available cuda devices and try moving a size 20 tensor to the GPU:

~~~python
import torch
assert torch.cuda.is_available()
assert torch.randn(20).cuda().is_cuda
~~~



The following wont produce error messages if cuDNN is installed:

~~~python
import torch
assert torch.backends.cudnn.enabled
~~~

___

And there you go, congratulations!