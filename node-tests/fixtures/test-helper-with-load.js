import { setResolver } from '@ember/test-helpers';
import resolver from './helpers/resolver';
import loadEmberExam from '@eflexsystems/ember-exam/test-support/load';
import { start } from '@eflexsystems/ember-mocha';

setResolver(resolver);

loadEmberExam();

start();
