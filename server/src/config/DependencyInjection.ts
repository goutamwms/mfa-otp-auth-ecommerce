import { IUserRepository } from '../domain/interfaces/IUserRepository';
import { ITokenService, ICookieService, IEmailService, IOtpGenerator } from '../domain/interfaces/IServices';
import { ICategoryRepository } from '../domain/interfaces/ICategoryRepository';
import { IColorRepository } from '../domain/interfaces/IColorRepository';
import { IProductRepository } from '../domain/interfaces/IProductRepository';

import { userRepository } from '../infrastructure/repositories/UserRepository';
import { tokenService, cookieService } from '../infrastructure/services/TokenService';
import { emailService } from '../infrastructure/services/EmailService';
import { otpGenerator } from '../infrastructure/services/OtpGenerator';

import { categoryRepository } from '../infrastructure/repositories/CategoryRepository';
import { colorRepository } from '../infrastructure/repositories/ColorRepository';
import { productRepository } from '../infrastructure/repositories/ProductRepository';

import { AuthService } from '../application/services/AuthService';
import { UserService } from '../application/services/UserService';
import { CategoryService } from '../application/services/ecommerce/CategoryService';
import { ColorService } from '../application/services/ecommerce/ColorService';
import { ProductService } from '../application/services/ecommerce/ProductService';

class Container {
  private services: Map<string, { instance?: any; factory: () => any }> = new Map();

  register<T>(name: string, factory: () => T): void {
    this.services.set(name, { factory });
  }

  resolve<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not registered`);
    }

    if (!service.instance) {
      service.instance = service.factory();
    }

    return service.instance;
  }

  clear(): void {
    this.services.clear();
  }
}

export const container = new Container();

// Auth services
container.register<IUserRepository>('UserRepository', () => userRepository);
container.register<ITokenService>('TokenService', () => tokenService);
container.register<ICookieService>('CookieService', () => cookieService);
container.register<IEmailService>('EmailService', () => emailService);
container.register<IOtpGenerator>('OtpGenerator', () => otpGenerator);

container.register<AuthService>('AuthService', () => new AuthService(
  container.resolve<IUserRepository>('UserRepository'),
  container.resolve<ITokenService>('TokenService'),
  container.resolve<IEmailService>('EmailService'),
  container.resolve<IOtpGenerator>('OtpGenerator'),
  container.resolve<ICookieService>('CookieService')
));

container.register<UserService>('UserService', () => new UserService(
  container.resolve<IUserRepository>('UserRepository'),
  container.resolve<ITokenService>('TokenService')
));

// E-commerce services
container.register<ICategoryRepository>('CategoryRepository', () => categoryRepository);
container.register<IColorRepository>('ColorRepository', () => colorRepository);
container.register<IProductRepository>('ProductRepository', () => productRepository);

container.register<CategoryService>('CategoryService', () => new CategoryService(
  container.resolve<ICategoryRepository>('CategoryRepository')
));

container.register<ColorService>('ColorService', () => new ColorService(
  container.resolve<IColorRepository>('ColorRepository')
));

container.register<ProductService>('ProductService', () => new ProductService(
  container.resolve<IProductRepository>('ProductRepository')
));

export default container;
