import { registerApiRoutes } from './components';
// import { registerLogging } from './middleware/globals';

import { Router } from 'express';

/**
 * Init Express REST routes
 *
 * @param {Router} router Router the routes are attached to
 * @returns {void}
 */
export function initRestRoutes(router: Router): void {
    const prefix = '/api';
    registerApiRoutes(router, prefix);
}
