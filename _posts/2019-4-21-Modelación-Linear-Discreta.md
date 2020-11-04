---
layout: post
mathjax: true
comments: true
title: Modelación Linear Discreta
categories: [Classnotes]
---

Parte dos de la guia para estudiar la materia del curso ICS1113 Optimización (curso de la Pontificia Universidad Católica de Chile). 
Faltan algunos.


**Técnica 1:**
Formular restricciones usando lógica proposicional y luego traducir.

- $i \rightarrow j$ lo reescribimos como $i \leq j$.
- $\neg i$ lo reescribimos como $1 - i$.
- un $\lor$ a la izquierda divide en dos condiciones: $i \lor j \rightarrow k$ se reescribe como $i \leq k$ y $j \leq k$.
- un $\land$ a la izquierda: $i \land j \rightarrow k$ se reescribe como $i + j \leq k + 1$


**Técnica 2:**
Para restricciones **condicionadas**.

$ax \leq b $ cuando $y$ se escribe: $ax \leq b + m(1-y)$.
Donde m es un valor muy grande, así tenemos que cuando $y=0$ la restricción funciona como si fuera un $ax \leq b + \infty = \infty$ que siempre se cumple.

$ax \geq b $ cuando $y$ se escribe: $ax \geq b - m(1-y)$.

Ejemplo para $y \in \\{0, 1\\}$:

$$
\begin{cases}
ax_i \leq b \qquad  \text{cuando } y = 1\\
ax_i \geq b \qquad \text{eoc.}
\end{cases}
$$

Queda:

$$ax_i \leq b + m(1-y)$$

$$ax_i \geq b - m(y)$$


**Técnica 3:**
Para **funciones por partes**.

si queremos modelar $$y = 
\begin{cases}
ax + b \qquad  \text{cuando } x \leq k\\
cx + d \qquad \text{eoc.}
\end{cases}
$$

Defino variables:

$$x_1 = 
\begin{cases}
x \qquad  \text{cuando } x \leq k\\
0 \qquad \text{eoc.}
\end{cases}
$$

$$x_2 = 
\begin{cases}
x \qquad  \text{cuando } x \geq k + 1\\
0 \qquad \text{eoc.}
\end{cases}
$$

$$w_1 = 
\begin{cases}
1 \qquad  \text{cuando } x \leq k\\
0 \qquad \text{eoc.}
\end{cases}
$$


$$w_2 = 
\begin{cases}
1 \qquad  \text{cuando } x \geq k + 1\\
0 \qquad \text{eoc.}
\end{cases}
$$

Las restricciones son:

$$y = (ax_1 + bw_1) + (cx_2 + dw_2)$$

$$x_1 \leq k w_1$$

$$x_2 \geq (k + 1) w_2$$

$$x = x_1 + x_2$$

$$1 = w_1 + w_2$$

### Problema de seleccionar: Knapsack

Llevar el producto $i$ me aporta $p_i$ dolares y me cuesta $w_i$. Tengo un total de $W$ dolares. Maxmimizar el precio de los productos que llevo.

Defino 
$$x_i = 
\begin{cases}
1  \qquad \text{cuando llevo producto } i\\
0  \qquad \text{eoc.}
\end{cases}
$$

$$\max \sum_i x_i p_i$$

s.a. 

$$\sum_i x_i w_i \leq W$$

___
### Problema con costos fijos: Producción e inventario con costos fijos 1

El mismo problema de producción e inventario (ver publicación pasada), pero si uso maquina en $t$ tengo un costo adicional $k^t$ (o sea, si produzco algo, tengo costo fijo).

Primero, como es un problema de producción e inventario defino $x_i^t$ como la cantidad de $i$ que produzco en $t$, y $y_i^t$ como hay almacenado de $i$ en $t$.

Defino  $$w^t = 
\begin{cases}
1  \qquad \text{usé la maquina en } t\\
0  \qquad \text{eoc.}
\end{cases}
$$

$$\min \sum_i\sum_t x_i^tc_i^t + y_i^th_i^t + w^tt k^tt$$

s.a.

$$\sum_i x_i^t \leq 0 + mw^t$$

Obtenemos esta restricción usando la técnica 2. Vemos que sólo si se prende la maquina ($w^t = 1$) podemos producir.

$$y_i^{t-1} + x_i^t = y_i^t + d_i^t  \qquad \forall i,t $$

$$x_{i}^t,y_i^t \geq 0 \qquad \forall i,t$$

___
### Problema con costos fijos y continuidad: Producción e inventario con costos fijos 2

Imaginemos ahora que en el problema anterior no hay costo fijo si la maquina estuvo prendida en $t-1$ (ej. no es necesario prenderla).

Defino  $$z^t = 
\begin{cases}
1  \qquad \text{encendí la maquina en } t\\
0  \qquad \text{eoc.}
\end{cases}
$$

Son las mismas restricciones que las de arriba, sólo agrego:

$$z_t \geq w^t - w^{t-1}$$


___
### Problemas de subdivision/asignación: Coloring

2 nodos en un grafo no pueden tener el mismo color si están conectados ($C_i$ son los nodos conectados con $i$). Minimice la cantidad de colores usados.

Defino $$x_{ik} = 
\begin{cases}
1 \qquad  \text{cuando nodo } i \text{ es de color } k\\
0 \qquad \text{eoc.}
\end{cases}
$$
 
Defino $$y_{k} = 
\begin{cases}
1 \qquad  \text{cuando uso color } k \\
0 \qquad \text{eoc.}
\end{cases}
$$
 
$$\min \sum_k y_k$$

s.a.

Todos los nodos con un color: $$\qquad \sum_k x_{ik} = 1 \qquad \forall i$$ 

Si uso un color se activa $y_k$: $$\qquad \sum_i x_{ik} \leq 0 + My_k \qquad \forall k$$

$x_{i,k} \rightarrow \neg x_{j, k}$ para nodos conectados: $$\qquad x_{ik} \leq 1- x{jk} \qquad \forall i, k, \forall j \in C_i$$


