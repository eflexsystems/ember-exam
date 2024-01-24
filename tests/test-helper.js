import { setResolver } from '@ember/test-helpers';
import resolver from './helpers/resolver';
import start from '@eflexsystems/ember-exam/test-support/start';

window.mocha.setup('bdd');

setResolver(resolver);
start();
