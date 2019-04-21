---
layout: post
mathjax: true
comments: true
title: Modelación Linear Continua
---

Esta guía la cree para mi mismo y el resto de los humanos hispano-hablantes luego de no encontrar una buena fuente para estudiar la materia del curso ICS1113 Optimización (curso de la Pontificia Universidad Católica de Chile).
En ramos como este hay unas pocas "herramientas" que debemos saber usar, combinándolas para lograr modelar el problema. 
Consideré una cantidad extensiva de ejercicios resueltos e intenté destilar en cada uno las técnicas requeridas para resolverlo, luego, definí otro problema de optimización linear mínimo que necesite de la técnica.

### Problema básico con restricciones: Movimiento de petroleo

Hay $i$ tipos de petroleo con distintos costos $c_i$ por cada litro de $i$ comprado, y con pesos diferentes $p_i$ por cada litro de $i$. Quiero maximizar mis ganancias, pero sujeto a que la suma de los pesos no puede ser mayor a mi capacidad.

Defino $x_i$ como cuántos litros de $i$ compro.

$$ \max \sum_i c_i x_i $$

s.a.

$$\sum_i p_i x_i \leq capacidad$$

$$x_i \geq 0 \qquad \forall i$$

---
### Problema con condiciones: Donantes de sangre

Hay $n$ personas de las que algunas pueden recibir sangre de tipo $i$ y otras no. 
Diremos que las personas con sangre $i$ pueden donar a personas $j$ si $d_{ij} = 1$ y $d_{ij} = 0$ si no pueden hacerlo.
El porcentaje de personas con sangre de tipo $i$ es $p_i$.
El costo por un litro de sangre $i$ es $c_i$.
Si tengo que comprar $n$ litros, minimice los costos pero manteniendo haya un litro para cada persona (comprar n litros).

Defino $x_{ij}$ como la cantidad de litros de $i$ que compro para $j$.

$$\min \sum_i c_i x_i$$

s.a.

$$ \sum_j d_{ij} x_{ij} = n p_i \qquad \forall i$$

$$x_{ij} \geq 0 \qquad \forall i, j$$

---
### Problema con combinaciones: Combos

Una empresa tiene 3 productos con precios $y_i$ y costo $c_i$. Los productos se venden individualmente o en "paquetes" (tengo sus precios y costos). 
Maximice ingresos (precio - costo).

Defino $x_j$ como el número de ofertas del servicio, y considero los productos individualemente y en paquetes como servicios distintos. Luego, tengo y posibles servicios que ofrecer.

$$\max \sum_j x_j (y_j - c_j)$$

Donde $y_j$ y $c_j$ son los precios/costos individuales cuando el servicio solo contiene un producto, y los precios/costos de los paquetes cuando corresponde.

s.a.

$$x_{j} \geq 0 \qquad \forall j$$


---
### Problema con relajación de restricción: Maquinas con sobre-tiempo

Maquina produce 5 uds. del producto 1 (que se vende a \\$10) o 8 uds. del producto 2 cada hora (se vende a \\$12). 
Maquina funciona 8 horas diarias pero puede excederse pagando un costo adicional de \\$5 cada hora.
Maximizar ingresos.

Definimos $x_i$ como el número de productos de tipo $i$ que producimos.

Definimos $y$ como la cantidad de horas extra trabajadas (nuestro **término de relajacion**).

$$\max 10x_1 + 12x_2 - 5y$$

s.a.

$$\frac{x_1}{5} + \frac{x_2}{8} \leq 8 + y$$

$$x_{i}, y \geq 0 \qquad \forall i$$

___
### Problema con inventario

Comienzo con 1000 unidades en la bodega.
Conozco la demanda (será $d_j^t$ en lugar $j$ en el tiempo $t$), y debo satisfacerla.
El máximo número de unidades de que puedo transportar en $t$ es $L^t$ , y el costo por unidad trasportada es $c_j^t$.

Defino $x_j^t$ como el número de unidades transportadas a $j$ en tiempo $t$.

Defino $A^t$ como la cantidad de unidades en bodega en el tiempo $t$.

$$\min \sum_j \sum_t c_j^t x_j^t$$

s.a.

$$\qquad A^0 = 1000$$

**Conservación de flujo**:
$$\qquad A^{t-1} = A^t + \sum_j x_j^t \qquad \forall t$$

$$\sum_j x_j^t \leq L^t  \qquad \forall t$$

$$x_{j}^t \geq 0 \qquad \forall j, t$$

___
### Problema de tareas con prerequisitos: Planificación proyecto

La tarea $i \in P$ ($P$ es conjunto de tareas) no puede hacerse antes que ninguna de las tareas en el subconjunto de $P$, $P_i$.
Cada tarea $i$ demora un tiempo fijo $t_i$.
Minimice el tiempo en hacer todas las tareas.

Definimos $x_i$ como el instante en que se comienza la tarea $i$.
Definimos $z$ como el tiempo de término de la última tarea (el tiempo que es mayor a todos los otros tiempos $\rightarrow$ **máximo**).

$$\min z$$

s.a.

$$z \geq x_i + t_i  \qquad \forall i$$

$$x_i \geq x_j + t_j   \qquad \forall i, \forall j \in P_i$$

$$x_{i} \geq 0 \qquad \forall i$$

___
### Producción e inventario con vencimiento

Produczo producto $i$ con costo unitario $c_i^t$ en tiempo $t$. Tengo bodegas en las que puedo almacenar los productos (con costo $h_i^t$), pero ojo que los productos vencen luego de $q_i$ dias... Minimizar costos de satisfacer la demanda $d_i^t$.

Primero, como es un problema de producción e inventario defino $x_i^t$ como la cantidad de $i$ que produzco en $t$, y $y_i^t$ como hay almacenado de $i$ en $t$.
Defino **cuanto boto** del producto $i$ en $t$ como $w_i^t$.

$$\min \sum_i\sum_t x_i^t c_i^t + y_i^th_i^t$$

s.a.

$$y_i^{t-1} + x_i^t = y_i^t + d_i^t + w_i^t   \qquad \forall i,t $$

$$w_i^t \geq \sum_{r=1}^{t-q_i}x_i^r - \sum_{r=1}^t d_i^r - \sum_{r=1}^{t-1} w_i^t   \qquad \forall i,t$$

Es decir, en $t$ debo botar al menos tantos productos $i$ como aquellos que he producido que ya han vencido (producidos hace $q_i$ dias o más), sin contar los que vendí y los que ya boté.

$$x_{i}^t,y_i^t, w_i^t  \geq 0 \qquad \forall i,t$$

$$y_i^0 = 0 \qquad \forall i$$

___









