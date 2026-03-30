// src/infrastructure/InMemoryPatternRepository.ts

import { Pattern, PatternCategory, CategoryGroup } from '../domain/Pattern';
import { PatternRepositoryPort } from '../domain/PatternRepositoryPort';

export class InMemoryPatternRepository implements PatternRepositoryPort {
  private readonly patterns: Pattern[] = [
    {
      id: 'singleton',
      name: 'Singleton',
      category: 'creacional',
      description: 'Garantiza que una clase tenga una única instancia global.',
      intent: 'Asegura una sola instancia y provee un punto de acceso global a ella.',
      examples: [
        {
          id: 'singleton-auth',
          title: 'Authorization Manager',
          description: 'Singleton que gestiona permisos de usuario: login, hasPermission, logout.',
          filePath: 'src/patterns/creacional/singleton/authorization.singleton.ts',
        },
        {
          id: 'singleton-config',
          title: 'App Config',
          description: 'Configuración centralizada: cambios en una instancia se reflejan en todas.',
          filePath: 'src/patterns/creacional/singleton/app-config.singleton.ts',
        },
      ],
    },
    {
      id: 'factory',
      name: 'Factory Method',
      category: 'creacional',
      description: 'Define una interfaz para crear objetos, delegando la instanciación a subclases.',
      intent: 'Desacopla la creación de objetos de su uso mediante una fábrica.',
      examples: [
        {
          id: 'factory-auth',
          title: 'Auth Factory',
          description: 'Fábrica que crea autenticadores DB, LDAP u OAuth según el tipo.',
          filePath: 'src/patterns/creacional/factory/auth-factory.ts',
        },
        {
          id: 'factory-notification',
          title: 'Notification Factory',
          description: 'Fábrica de notificadores Email, SMS y Push para un mismo destinatario.',
          filePath: 'src/patterns/creacional/factory/notification-factory.ts',
        },
      ],
    },
    {
      id: 'builder',
      name: 'Builder',
      category: 'creacional',
      description: 'Construye objetos complejos paso a paso con métodos encadenables.',
      intent: 'Separa la construcción de un objeto complejo de su representación.',
      examples: [
        {
          id: 'builder-query',
          title: 'Query Builder',
          description: 'Construye queries SQL con from(), select(), where(), orderBy(), limit().',
          filePath: 'src/patterns/creacional/builder/query-builder.ts',
        },
        {
          id: 'builder-http',
          title: 'HTTP Request Builder',
          description: 'Construye requests HTTP con método, auth, body y timeout encadenados.',
          filePath: 'src/patterns/creacional/builder/http-request-builder.ts',
        },
      ],
    },
    {
      id: 'adapter',
      name: 'Adapter',
      category: 'estructural',
      description: 'Convierte la interfaz de una clase en otra que el cliente espera.',
      intent: 'Permite que interfaces incompatibles trabajen juntas.',
      examples: [
        {
          id: 'adapter-google',
          title: 'Google OAuth Adapter',
          description: 'Adapta GoogleOAuthClient a la interfaz Authenticator estándar.',
          filePath: 'src/patterns/estructural/adapter/google-oauth.adapter.ts',
        },
        {
          id: 'adapter-legacy',
          title: 'Legacy Auth Adapter',
          description: 'Traduce códigos numéricos del sistema legado a la interfaz moderna.',
          filePath: 'src/patterns/estructural/adapter/legacy-auth.adapter.ts',
        },
      ],
    },
    {
      id: 'facade',
      name: 'Facade',
      category: 'estructural',
      description: 'Proporciona una interfaz simplificada a un subsistema complejo.',
      intent: 'Oculta la complejidad interna exponiendo una API de alto nivel.',
      examples: [
        {
          id: 'facade-security',
          title: 'Security Facade',
          description: 'Orquesta Auth, Permissions, Audit y Session en un único login().',
          filePath: 'src/patterns/estructural/facade/security.facade.ts',
        },
        {
          id: 'facade-order',
          title: 'Order Facade',
          description: 'Orquesta Inventory, Payment, Shipping y Email en placeOrder().',
          filePath: 'src/patterns/estructural/facade/order.facade.ts',
        },
      ],
    },
    {
      id: 'decorator',
      name: 'Decorator',
      category: 'estructural',
      description: 'Agrega responsabilidades a objetos dinámicamente sin modificar su clase.',
      intent: 'Extiende funcionalidad envolviendo objetos en decoradores.',
      examples: [
        {
          id: 'decorator-logger',
          title: 'Logger + Cache Decorator',
          description: 'Apila LoggedDataService y CachedDataService sobre RealDataService.',
          filePath: 'src/patterns/estructural/decorator/logger.decorator.ts',
        },
        {
          id: 'decorator-cache',
          title: 'Cache Decorator',
          description: 'CachedUserService evita llamadas repetidas al servicio real.',
          filePath: 'src/patterns/estructural/decorator/cache.decorator.ts',
        },
      ],
    },
    {
      id: 'proxy',
      name: 'Proxy',
      category: 'estructural',
      description: 'Proporciona un sustituto que controla el acceso al objeto real.',
      intent: 'Controla acceso, añade lazy loading o registra operaciones.',
      examples: [
        {
          id: 'proxy-access',
          title: 'Access Control Proxy',
          description: 'Verifica roles ADMIN/USER antes de read, write y delete.',
          filePath: 'src/patterns/estructural/proxy/access-control.proxy.ts',
        },
        {
          id: 'proxy-lazy',
          title: 'Lazy Loading Proxy',
          description: 'Retrasa la instanciación de HeavyReportService hasta la primera llamada.',
          filePath: 'src/patterns/estructural/proxy/lazy-loading.proxy.ts',
        },
      ],
    },
    {
      id: 'chain',
      name: 'Chain of Responsibility',
      category: 'comportamiento',
      description: 'Pasa solicitudes por una cadena de manejadores hasta que uno la procese.',
      intent: 'Desacopla emisor y receptor permitiendo múltiples manejadores.',
      examples: [
        {
          id: 'chain-access',
          title: 'Access Validation Chain',
          description: 'Cadena Auth → Role → Resource con casos aprobado y tres denegados.',
          filePath: 'src/patterns/comportamiento/chain/access-validation.chain.ts',
        },
        {
          id: 'chain-http',
          title: 'HTTP Middleware Chain',
          description: 'Pipeline RateLimiter → CORS → Logger → Auth con request válida e inválida.',
          filePath: 'src/patterns/comportamiento/chain/http-middleware.chain.ts',
        },
      ],
    },
    {
      id: 'observer',
      name: 'Observer',
      category: 'comportamiento',
      description: 'Notifica automáticamente a múltiples objetos cuando cambia el estado.',
      intent: 'Define dependencia uno-a-muchos entre objetos.',
      examples: [
        {
          id: 'observer-event',
          title: 'Event System Observer',
          description: 'EventEmitter con on/off/emit y observers Audit, Email y Metrics.',
          filePath: 'src/patterns/comportamiento/observer/event-system.observer.ts',
        },
        {
          id: 'observer-stock',
          title: 'Stock Market Observer',
          description: 'StockMarket con AlertObserver (umbral) y PortfolioObserver (holdings).',
          filePath: 'src/patterns/comportamiento/observer/stock.observer.ts',
        },
      ],
    },
    {
      id: 'strategy',
      name: 'Strategy',
      category: 'comportamiento',
      description: 'Define una familia de algoritmos intercambiables en tiempo de ejecución.',
      intent: 'Encapsula algoritmos y los hace intercambiables.',
      examples: [
        {
          id: 'strategy-discount',
          title: 'Discount Strategy',
          description: 'ShoppingCart con estrategias Seasonal, Volume, VIP y NoDiscount.',
          filePath: 'src/patterns/comportamiento/strategy/discount.strategy.ts',
        },
        {
          id: 'strategy-payment',
          title: 'Payment Strategy',
          description: 'PaymentProcessor con CreditCard, BankTransfer y Crypto.',
          filePath: 'src/patterns/comportamiento/strategy/payment.strategy.ts',
        },
      ],
    },
    {
      id: 'command',
      name: 'Command',
      category: 'comportamiento',
      description: 'Encapsula operaciones como objetos con soporte de undo/redo.',
      intent: 'Parametriza acciones, permite deshacer y registrar historial.',
      examples: [
        {
          id: 'command-order',
          title: 'Order History Command',
          description: 'OrderCommandHistory con execute/undo/redo para pedidos.',
          filePath: 'src/patterns/comportamiento/command/order-history.command.ts',
        },
        {
          id: 'command-editor',
          title: 'Text Editor Command',
          description: 'TextEditor con Insert, Delete y Format commands con undo.',
          filePath: 'src/patterns/comportamiento/command/text-editor.command.ts',
        },
      ],
    },
    {
      id: 'state',
      name: 'State',
      category: 'comportamiento',
      description: 'Permite que un objeto altere su comportamiento cuando cambia su estado.',
      intent: 'Encapsula estados como objetos y delega comportamiento al estado actual.',
      examples: [
        {
          id: 'state-order',
          title: 'Order Flow State',
          description: 'Máquina de estados Draft→Confirmed→Paid→Shipped→Delivered y cancelación.',
          filePath: 'src/patterns/comportamiento/state/order-flow.state.ts',
        },
        {
          id: 'state-session',
          title: 'Session State',
          description: 'UserSession con estados Anonymous, Authenticated y Expired.',
          filePath: 'src/patterns/comportamiento/state/session.state.ts',
        },
      ],
    },
    {
      id: 'template',
      name: 'Template Method',
      category: 'comportamiento',
      description: 'Define el esqueleto de un algoritmo dejando algunos pasos a subclases.',
      intent: 'Reutiliza la estructura del algoritmo variando solo los pasos concretos.',
      examples: [
        {
          id: 'template-report',
          title: 'Report Generator',
          description: 'Plantilla fetchData→processData→formatOutput→saveReport para Sales e Inventory.',
          filePath: 'src/patterns/comportamiento/template/report-generator.template.ts',
        },
        {
          id: 'template-exporter',
          title: 'Data Exporter',
          description: 'Plantilla connect→extract→transform→load→disconnect para CSV y JSON.',
          filePath: 'src/patterns/comportamiento/template/data-exporter.template.ts',
        },
      ],
    },
    {
      id: 'repository',
      name: 'Repository',
      category: 'comportamiento',
      description: 'Abstrae el acceso a datos detrás de una interfaz de colección.',
      intent: 'Desacopla la lógica de negocio del mecanismo de persistencia.',
      examples: [
        {
          id: 'repository-memory',
          title: 'In-Memory Repository',
          description: 'UserRepository sincrónico con save, findById, findByEmail, findByRole.',
          filePath: 'src/patterns/comportamiento/repository/in-memory.repository.ts',
        },
        {
          id: 'repository-async',
          title: 'Async Repository',
          description: 'UserRepository con métodos async que simulan latencia con setTimeout.',
          filePath: 'src/patterns/comportamiento/repository/async-repository.ts',
        },
      ],
    },
    {
      id: 'valueobject',
      name: 'Value Object',
      category: 'comportamiento',
      description: 'Objetos inmutables definidos por sus atributos, sin identidad propia.',
      intent: 'Garantiza igualdad por valor y encapsula reglas de dominio.',
      examples: [
        {
          id: 'vo-user',
          title: 'User Value Objects',
          description: 'Email (valida y normaliza), Password (hash), Role (permisos) usados en User.',
          filePath: 'src/patterns/comportamiento/valueobject/user-value-objects.ts',
        },
        {
          id: 'vo-money',
          title: 'Money Value Object',
          description: 'Money con add/subtract/multiply/equals e Invoice con totales y descuento.',
          filePath: 'src/patterns/comportamiento/valueobject/money-value-object.ts',
        },
      ],
    },
  ];

  findAll(): Pattern[] {
    return [...this.patterns];
  }

  findById(id: string): Pattern | undefined {
    return this.patterns.find((p) => p.id === id);
  }

  findByCategory(category: PatternCategory): Pattern[] {
    return this.patterns.filter((p) => p.category === category);
  }

  getAllCategories(): CategoryGroup[] {
    const categories: PatternCategory[] = ['creacional', 'estructural', 'comportamiento'];
    const labels: Record<PatternCategory, string> = {
      creacional: 'Patrones Creacionales',
      estructural: 'Patrones Estructurales',
      comportamiento: 'Patrones de Comportamiento',
    };
    return categories.map((cat) => ({
      name: cat,
      label: labels[cat],
      patterns: this.findByCategory(cat),
    }));
  }
}
