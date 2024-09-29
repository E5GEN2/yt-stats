import { Router } from 'express';
import TestCoreRoutes from './core/routes';

/**
 * Init Express api routes (Agent)
 *
 * @param {Router} router Router the routes are attached to
 * @param {string} prefix Prefix for attached routes
 * @returns {void}
 */
export function registerTestRoutes(router: Router, prefix = ''): void {
    /**
     * endpoint is compulsory because this pattern is exempt
     * from anti csrf protection.
     */
    router.use(`${prefix}/stats`, new TestCoreRoutes().router);
}
