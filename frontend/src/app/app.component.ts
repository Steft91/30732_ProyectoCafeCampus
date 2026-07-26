import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

type Rol = 'admin' | 'personal' | 'estudiante';
type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO_PARA_RETIRAR' | 'ENTREGADO' | 'CANCELADO';

interface Categoria {
  id: string;
  nombre: string;
}

interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: string;
  imagen?: string | null;
  disponible: boolean;
  categoria?: Categoria;
}

interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface PedidoItem {
  productoId: string;
  nombre: string;
  precio: string;
  cantidad: number;
}

interface Pedido {
  id: string;
  usuarioId: string;
  estado: EstadoPedido;
  total: string;
  creadoEn: string;
  items: PedidoItem[];
}

interface LoginResponse {
  access_token: string;
  rol: Rol;
}

interface DemoAccount {
  label: string;
  rol: Rol;
  email: string;
  password: string;
  hint: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api';

  readonly productos = signal<Producto[]>([]);
  readonly pedidos = signal<Pedido[]>([]);
  readonly misPedidos = signal<Pedido[]>([]);
  readonly carrito = signal<CartItem[]>([]);
  readonly token = signal<string | null>(null);
  readonly rol = signal<Rol | null>(null);
  readonly estado = signal('Bienvenidx a Cafe Campus');
  readonly error = signal<string | null>(null);
  readonly pedido = signal<Pedido | null>(null);
  readonly cargando = signal(false);
  readonly filtro = signal('Todos');
  readonly loginAbierto = signal(false);
  readonly email = signal('estudiante@campus.edu');
  readonly password = signal('est123');
  readonly ultimoAgregado = signal<string | null>(null);

  readonly cuentasDemo: DemoAccount[] = [
    { label: 'Estudiante', rol: 'estudiante', email: 'estudiante@campus.edu', password: 'est123', hint: 'Puede comprar y revisar sus pedidos.' },
    { label: 'Mesero', rol: 'personal', email: 'personal@campus.edu', password: 'personal123', hint: 'Puede ver pedidos y avanzar estados.' },
    { label: 'Admin', rol: 'admin', email: 'admin@campus.edu', password: 'admin123', hint: 'Puede ver operacion completa.' },
  ];

  readonly categorias = computed(() => {
    const nombres = this.productos()
      .map((producto) => producto.categoria?.nombre ?? 'Sin categoria')
      .filter((nombre, index, lista) => lista.indexOf(nombre) === index);

    return ['Todos', ...nombres];
  });

  readonly productosVisibles = computed(() => {
    if (this.puedeAdministrar()) return this.productos();
    return this.productos().filter((producto) => producto.disponible);
  });

  readonly productosFiltrados = computed(() => {
    const productos = this.productosVisibles();
    if (this.filtro() === 'Todos') return productos;
    return productos.filter((producto) => producto.categoria?.nombre === this.filtro());
  });

  readonly total = computed(() =>
    this.carrito().reduce((sum, item) => sum + Number(item.producto.precio) * item.cantidad, 0),
  );

  readonly cantidadItems = computed(() =>
    this.carrito().reduce((sum, item) => sum + item.cantidad, 0),
  );

  readonly ultimoPedido = computed(() => {
    const pedidos = this.misPedidos();
    if (pedidos.length === 0) return this.pedido();
    return [...pedidos].sort((a, b) =>
      new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime(),
    )[0];
  });

  readonly nombreRol = computed(() => {
    const rol = this.rol();
    if (rol === 'personal') return 'Mesero';
    if (rol === 'admin') return 'Admin';
    if (rol === 'estudiante') return 'Estudiante';
    return 'Invitado';
  });

  readonly puedeComprar = computed(() => this.rol() === 'estudiante');
  readonly puedeAtender = computed(() => this.rol() === 'admin' || this.rol() === 'personal');
  readonly puedeAdministrar = computed(() => this.rol() === 'admin');
  readonly categoriasAdmin = computed(() => {
    const categorias = this.productos()
      .map((producto) => producto.categoria)
      .filter((categoria): categoria is Categoria => Boolean(categoria));

    return categorias.filter((categoria, index, lista) =>
      lista.findIndex((actual) => actual.id === categoria.id) === index,
    );
  });

  readonly nuevoProductoNombre = signal('');
  readonly nuevoProductoDescripcion = signal('');
  readonly nuevoProductoPrecio = signal('2.50');
  readonly nuevoProductoCategoriaId = signal('');

  async ngOnInit() {
    this.loginAbierto.set(true);
  }

  usarCuenta(cuenta: DemoAccount) {
    this.email.set(cuenta.email);
    this.password.set(cuenta.password);
  }

  async login() {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
          email: this.email(),
          password: this.password(),
        }),
      );

      this.token.set(response.access_token);
      this.rol.set(response.rol);
      this.pedido.set(null);
      this.misPedidos.set([]);
      this.pedidos.set([]);
      this.carrito.set([]);
      this.loginAbierto.set(false);
      this.estado.set(`Sesion activa: ${this.nombreRol()}`);
      await this.cargarProductos();
      if (this.categoriasAdmin().length > 0 && !this.nuevoProductoCategoriaId()) {
        this.nuevoProductoCategoriaId.set(this.categoriasAdmin()[0].id);
      }
      if (this.puedeComprar()) await this.cargarMisPedidos();
      if (this.puedeAtender()) await this.cargarPedidos();
    } catch (error) {
      this.error.set(this.extraerMensaje(error));
    } finally {
      this.cargando.set(false);
    }
  }

  cerrarSesion() {
    this.token.set(null);
    this.rol.set(null);
    this.productos.set([]);
    this.pedidos.set([]);
    this.misPedidos.set([]);
    this.carrito.set([]);
    this.pedido.set(null);
    this.estado.set('Sesion cerrada');
    this.loginAbierto.set(true);
  }

  async cargarProductos() {
    if (!this.token()) return;
    this.cargando.set(true);
    this.error.set(null);

    try {
      const productos = await firstValueFrom(
        this.http.get<Producto[]>(`${this.apiUrl}/productos`, { headers: this.headers() }),
      );
      this.productos.set(productos);
      if (this.categoriasAdmin().length > 0 && !this.nuevoProductoCategoriaId()) {
        this.nuevoProductoCategoriaId.set(this.categoriasAdmin()[0].id);
      }
      const disponibles = productos.filter((producto) => producto.disponible).length;
      this.estado.set(`${disponibles} productos listos para servir`);
    } catch (error) {
      this.error.set(this.extraerMensaje(error));
    } finally {
      this.cargando.set(false);
    }
  }

  async cargarPedidos() {
    if (!this.token() || !this.puedeAtender()) return;
    this.cargando.set(true);
    this.error.set(null);

    try {
      const pedidos = await firstValueFrom(
        this.http.get<Pedido[]>(`${this.apiUrl}/pedidos`, { headers: this.headers() }),
      );
      this.pedidos.set(pedidos);
    } catch (error) {
      this.error.set(this.extraerMensaje(error));
    } finally {
      this.cargando.set(false);
    }
  }


  async cargarMisPedidos() {
    if (!this.token() || !this.puedeComprar()) return;
    this.cargando.set(true);
    this.error.set(null);

    try {
      const pedidos = await firstValueFrom(
        this.http.get<Pedido[]>(`${this.apiUrl}/pedidos/mis-pedidos`, { headers: this.headers() }),
      );
      this.misPedidos.set(pedidos);
    } catch (error) {
      this.error.set(this.extraerMensaje(error));
    } finally {
      this.cargando.set(false);
    }
  }

  agregar(producto: Producto) {
    if (!this.puedeComprar()) {
      this.error.set('Inicia sesion como estudiante para armar un pedido');
      this.loginAbierto.set(!this.token());
      return;
    }

    const actual = this.carrito();
    const existente = actual.find((item) => item.producto.id === producto.id);
    if (existente) {
      this.carrito.set(actual.map((item) =>
        item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item,
      ));
      this.notificarAgregado(producto.nombre);
      return;
    }
    this.carrito.set([...actual, { producto, cantidad: 1 }]);
    this.notificarAgregado(producto.nombre);
  }

  quitar(productoId: string) {
    this.carrito.set(
      this.carrito()
        .map((item) => item.producto.id === productoId ? { ...item, cantidad: item.cantidad - 1 } : item)
        .filter((item) => item.cantidad > 0),
    );
  }

  limpiarCarrito() {
    this.carrito.set([]);
    this.pedido.set(null);
  }

  async crearPedido() {
    if (this.carrito().length === 0) {
      this.error.set('Agrega al menos un producto al pedido');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);
    this.pedido.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<Pedido>(
          `${this.apiUrl}/pedidos`,
          { items: this.carrito().map((item) => ({ productoId: item.producto.id, cantidad: item.cantidad })) },
          { headers: this.headers() },
        ),
      );

      this.pedido.set(response);
      this.estado.set('Pedido enviado a cocina');
      this.ultimoAgregado.set(null);
      this.carrito.set([]);
      await this.cargarMisPedidos();
    } catch (error) {
      this.error.set(this.extraerMensaje(error));
    } finally {
      this.cargando.set(false);
    }
  }


  async crearProducto() {
    if (!this.puedeAdministrar()) return;
    if (!this.nuevoProductoNombre().trim() || !this.nuevoProductoCategoriaId()) {
      this.error.set('Completa nombre y categoria del producto');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(
        this.http.post(
          `${this.apiUrl}/productos`,
          {
            nombre: this.nuevoProductoNombre().trim(),
            descripcion: this.nuevoProductoDescripcion().trim(),
            precio: Number(this.nuevoProductoPrecio()),
            categoriaId: this.nuevoProductoCategoriaId(),
            disponible: true,
          },
          { headers: this.headers() },
        ),
      );
      this.nuevoProductoNombre.set('');
      this.nuevoProductoDescripcion.set('');
      this.nuevoProductoPrecio.set('2.50');
      await this.cargarProductos();
      this.estado.set('Producto agregado al menu');
    } catch (error) {
      this.error.set(this.extraerMensaje(error));
    } finally {
      this.cargando.set(false);
    }
  }

  async actualizarPrecio(producto: Producto, precio: string) {
    if (!this.puedeAdministrar()) return;
    const valor = Number(precio);
    if (!Number.isFinite(valor) || valor <= 0) {
      this.error.set('Ingresa un precio valido');
      return;
    }

    await this.actualizarProducto(producto.id, { precio: valor }, 'Precio actualizado');
  }

  async alternarDisponibilidad(producto: Producto) {
    if (!this.puedeAdministrar()) return;
    await this.actualizarProducto(
      producto.id,
      { disponible: !producto.disponible },
      producto.disponible ? 'Producto pausado del menu' : 'Producto disponible en menu',
    );
  }

  async eliminarProducto(producto: Producto) {
    if (!this.puedeAdministrar()) return;
    const confirmado = window.confirm(`Eliminar ${producto.nombre} del catalogo?`);
    if (!confirmado) return;

    this.cargando.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/productos/${producto.id}`, { headers: this.headers() }),
      );
      await this.cargarProductos();
      this.estado.set('Producto eliminado del catalogo');
    } catch (error) {
      this.error.set(this.extraerMensaje(error));
    } finally {
      this.cargando.set(false);
    }
  }

  private async actualizarProducto(productoId: string, body: { precio?: number; disponible?: boolean }, mensaje: string) {
    this.cargando.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(
        this.http.put(`${this.apiUrl}/productos/${productoId}`, body, { headers: this.headers() }),
      );
      await this.cargarProductos();
      this.estado.set(mensaje);
    } catch (error) {
      this.error.set(this.extraerMensaje(error));
    } finally {
      this.cargando.set(false);
    }
  }

  async cambiarEstado(pedido: Pedido, estado: EstadoPedido) {
    this.cargando.set(true);
    this.error.set(null);

    try {
      await firstValueFrom(
        this.http.patch(`${this.apiUrl}/pedidos/${pedido.id}/estado`, { estado }, { headers: this.headers() }),
      );
      await this.cargarPedidos();
      this.estado.set(`Pedido #${pedido.id.slice(0, 8)} actualizado`);
    } catch (error) {
      this.error.set(this.extraerMensaje(error));
    } finally {
      this.cargando.set(false);
    }
  }



  estadoClase(estado: EstadoPedido) {
    return `status-${estado.toLowerCase().replaceAll('_', '-')}`;
  }

  private notificarAgregado(nombre: string) {
    this.ultimoAgregado.set(`${nombre} agregado al pedido`);
    this.estado.set(`${nombre} agregado al pedido`);
    window.setTimeout(() => {
      if (this.ultimoAgregado() === `${nombre} agregado al pedido`) {
        this.ultimoAgregado.set(null);
      }
    }, 1800);
  }

  productImage(producto: Producto) {
    if (producto.imagen) return producto.imagen;

    const nombre = producto.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const imagenes: Array<[string, string]> = [
      ['cappuccino', 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=900&q=80'],
      ['latte', 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=900&q=80'],
      ['americano', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80'],
      ['chocolate', 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=900&q=80'],
      ['te verde', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
      ['frappe', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80'],
      ['limonada', 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80'],
      ['smoothie', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=900&q=80'],
      ['brownie', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80'],
      ['cheesecake', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80'],
      ['croissant', 'https://images.unsplash.com/photo-1599940778173-e276d4acb2bb?q=80&w=855&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
      ['muffin', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=900&q=80'],
      ['sandwich', 'https://images.unsplash.com/photo-1553909489-cd47e0907980?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
      ['empanada', 'https://images.unsplash.com/photo-1624128082323-beb6b8b508db?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
      ['tostada', 'https://images.unsplash.com/photo-1738605488416-e7d955b1788f?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
    ];

    return imagenes.find(([clave]) => nombre.includes(clave))?.[1]
      ?? 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80';
  }

  imageAlt(producto: Producto) {
    return `${producto.nombre} de Cafe Campus`;
  }

  seleccionarCategoria(categoria: string) {
    this.filtro.set(categoria);
  }

  precio(producto: Producto) {
    return Number(producto.precio);
  }

  private headers() {
    const token = this.token();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private extraerMensaje(error: unknown) {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const body = (error as { error?: unknown }).error;
      if (typeof body === 'string') return body;
      if (typeof body === 'object' && body !== null && 'message' in body) {
        const message = (body as { message?: unknown }).message;
        return Array.isArray(message) ? message.join(', ') : String(message);
      }
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return String((error as { message?: unknown }).message);
    }
    return 'No se pudo completar la operacion';
  }

  etiquetaEstado(estado: EstadoPedido) {
    const etiquetas: Record<EstadoPedido, string> = {
      PENDIENTE: 'Pendiente',
      EN_PREPARACION: 'En preparacion',
      LISTO_PARA_RETIRAR: 'Listo para retirar',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    };
    return etiquetas[estado];
  }
}

