/**
 * Test de sécurité hCaptcha
 * Vérifie que la protection CAPTCHA fonctionne correctement
 */

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface TestResult {
  scenario: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

/**
 * Test 1: Inscription sans token CAPTCHA doit échouer
 */
async function testRegistrationWithoutCaptcha(): Promise<void> {
  console.log('\n🔒 Test 1: Inscription sans token CAPTCHA');

  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: 'test-no-captcha@example.com',
      password: 'TestPassword123',
      firstName: 'Test',
      lastName: 'User',
    });

    // Si on arrive ici, c'est un échec de sécurité
    console.log('  ❌ ÉCHEC: Inscription réussie sans CAPTCHA !');
    results.push({
      scenario: 'Inscription sans CAPTCHA',
      passed: false,
      details: 'L\'inscription a réussi sans token CAPTCHA (faille de sécurité)',
    });
  } catch (error: any) {
    const message = error.response?.data?.message || '';
    if (message.includes('CAPTCHA')) {
      console.log('  ✅ Inscription bloquée: "' + message + '"');
      results.push({
        scenario: 'Inscription sans CAPTCHA',
        passed: true,
        details: 'Inscription correctement bloquée sans token CAPTCHA',
      });
    } else {
      console.log('  ⚠️  Inscription bloquée mais message incorrect: ' + message);
      results.push({
        scenario: 'Inscription sans CAPTCHA',
        passed: false,
        details: 'Message d\'erreur incorrect: ' + message,
      });
    }
  }
}

/**
 * Test 2: Inscription avec token CAPTCHA invalide doit échouer
 */
async function testRegistrationWithInvalidCaptcha(): Promise<void> {
  console.log('\n🔒 Test 2: Inscription avec token CAPTCHA invalide');

  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email: 'test-invalid-captcha@example.com',
      password: 'TestPassword123',
      firstName: 'Test',
      lastName: 'User',
      captchaToken: 'fake-invalid-token-12345',
    });

    console.log('  ❌ ÉCHEC: Inscription réussie avec token invalide !');
    results.push({
      scenario: 'Inscription avec CAPTCHA invalide',
      passed: false,
      details: 'L\'inscription a réussi avec un token invalide (faille de sécurité)',
    });
  } catch (error: any) {
    const message = error.response?.data?.message || '';
    if (message.includes('CAPTCHA invalide') || message.includes('CAPTCHA')) {
      console.log('  ✅ Inscription bloquée: "' + message + '"');
      results.push({
        scenario: 'Inscription avec CAPTCHA invalide',
        passed: true,
        details: 'Inscription correctement bloquée avec token invalide',
      });
    } else {
      console.log('  ⚠️  Inscription bloquée mais message incorrect: ' + message);
      results.push({
        scenario: 'Inscription avec CAPTCHA invalide',
        passed: false,
        details: 'Message d\'erreur incorrect: ' + message,
      });
    }
  }
}

/**
 * Test 3: Tentatives multiples sans CAPTCHA doivent toutes échouer
 */
async function testMultipleAttemptsWithoutCaptcha(): Promise<void> {
  console.log('\n🔒 Test 3: 10 tentatives d\'inscription sans CAPTCHA');

  let blockedCount = 0;
  const attempts = 10;

  for (let i = 0; i < attempts; i++) {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email: `test-spam-${i}@example.com`,
        password: 'TestPassword123',
        firstName: 'Spammer',
        lastName: `Bot${i}`,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || '';
      if (message.includes('CAPTCHA')) {
        blockedCount++;
      }
    }
  }

  if (blockedCount === attempts) {
    console.log(`  ✅ ${blockedCount}/${attempts} tentatives bloquées par CAPTCHA`);
    results.push({
      scenario: 'Tentatives multiples sans CAPTCHA',
      passed: true,
      details: `Toutes les ${attempts} tentatives ont été bloquées`,
    });
  } else {
    console.log(`  ❌ Seulement ${blockedCount}/${attempts} tentatives bloquées`);
    results.push({
      scenario: 'Tentatives multiples sans CAPTCHA',
      passed: false,
      details: `${attempts - blockedCount} tentatives ont réussi sans CAPTCHA`,
    });
  }
}

/**
 * Test 4: Vérifier que le CAPTCHA est requis même pour les emails différents
 */
async function testCaptchaRequiredForAllEmails(): Promise<void> {
  console.log('\n🔒 Test 4: CAPTCHA requis pour tous les emails');

  const testEmails = [
    'user1@test.com',
    'admin@test.com',
    'test@gmail.com',
    'spammer@malicious.com',
  ];

  let allBlocked = true;

  for (const email of testEmails) {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email,
        password: 'TestPassword123',
        firstName: 'Test',
        lastName: 'User',
      });

      allBlocked = false;
      console.log(`  ❌ Email ${email} a pu s'inscrire sans CAPTCHA`);
    } catch (error: any) {
      const message = error.response?.data?.message || '';
      if (!message.includes('CAPTCHA')) {
        allBlocked = false;
        console.log(`  ⚠️  Email ${email} bloqué mais pas par CAPTCHA: ${message}`);
      }
    }
  }

  if (allBlocked) {
    console.log(`  ✅ CAPTCHA requis pour tous les ${testEmails.length} emails testés`);
    results.push({
      scenario: 'CAPTCHA requis pour tous les emails',
      passed: true,
      details: 'CAPTCHA appliqué uniformément sans exception',
    });
  } else {
    console.log('  ❌ Certains emails ont pu bypass le CAPTCHA');
    results.push({
      scenario: 'CAPTCHA requis pour tous les emails',
      passed: false,
      details: 'Le CAPTCHA n\'est pas appliqué uniformément',
    });
  }
}

/**
 * Test 5: Vérifier que les headers peuvent être spoofés
 */
async function testHeaderSpoofing(): Promise<void> {
  console.log('\n🔒 Test 5: Tentative de spoofing d\'headers');

  const spoofedHeaders = {
    'X-Forwarded-For': '172.22.0.5', // IP Docker interne (whitelistée en dev)
    'X-Real-IP': '127.0.0.1',
    'User-Agent': 'CTFd-Webhook/1.0',
  };

  try {
    await axios.post(
      `${API_URL}/auth/register`,
      {
        email: 'spoof-test@example.com',
        password: 'TestPassword123',
        firstName: 'Spoof',
        lastName: 'Test',
      },
      { headers: spoofedHeaders }
    );

    console.log('  ❌ ÉCHEC: Inscription réussie avec headers spoofés !');
    results.push({
      scenario: 'Spoofing d\'headers',
      passed: false,
      details: 'Les headers spoofés ont permis de bypass le CAPTCHA',
    });
  } catch (error: any) {
    const message = error.response?.data?.message || '';
    if (message.includes('CAPTCHA')) {
      console.log('  ✅ Inscription bloquée malgré les headers spoofés');
      results.push({
        scenario: 'Spoofing d\'headers',
        passed: true,
        details: 'Les headers spoofés n\'ont pas permis de bypass le CAPTCHA',
      });
    } else {
      console.log('  ⚠️  Bloqué pour une autre raison: ' + message);
      results.push({
        scenario: 'Spoofing d\'headers',
        passed: true,
        details: 'Bloqué (raison: ' + message + ')',
      });
    }
  }
}

/**
 * Test 6: Vérifier la configuration de sécurité
 */
async function testSecurityConfiguration(): Promise<void> {
  console.log('\n🔒 Test 6: Configuration de sécurité');

  // Vérifier que HCAPTCHA_SECRET est défini
  const hcaptchaSecretDefined = process.env.HCAPTCHA_SECRET !== undefined;

  if (hcaptchaSecretDefined) {
    console.log('  ✅ HCAPTCHA_SECRET est défini');

    // Vérifier que ce n\'est pas une clé de test en production
    if (process.env.NODE_ENV === 'production' &&
        process.env.HCAPTCHA_SECRET === '0x0000000000000000000000000000000000000000') {
      console.log('  ⚠️  ATTENTION: Clé de TEST utilisée en PRODUCTION !');
      results.push({
        scenario: 'Configuration de sécurité',
        passed: false,
        details: 'Clé de test hCaptcha utilisée en production',
      });
    } else {
      console.log('  ✅ Configuration CAPTCHA appropriée pour l\'environnement');
      results.push({
        scenario: 'Configuration de sécurité',
        passed: true,
        details: 'Configuration hCaptcha correcte',
      });
    }
  } else {
    console.log('  ⚠️  HCAPTCHA_SECRET non défini (CAPTCHA désactivé)');
    results.push({
      scenario: 'Configuration de sécurité',
      passed: false,
      details: 'HCAPTCHA_SECRET non configuré',
    });
  }
}

/**
 * Afficher le résumé des tests
 */
function displaySummary(): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS DE SÉCURITÉ CAPTCHA');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`\n${icon} ${result.scenario}`);
    console.log(`   ${result.details}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`RÉSULTAT: ${passed}/${total} tests passés`);
  console.log('='.repeat(60));

  if (passed === total) {
    console.log('\n🎉 Tous les tests de sécurité CAPTCHA ont réussi !');
    console.log('✅ Le système est protégé contre:');
    console.log('   - Inscriptions sans CAPTCHA');
    console.log('   - Tokens CAPTCHA invalides');
    console.log('   - Attaques par spam automatisé');
    console.log('   - Spoofing d\'headers');
  } else {
    console.log('\n⚠️  ATTENTION: Des failles de sécurité ont été détectées !');
    console.log('Veuillez corriger les problèmes avant le déploiement en production.');
  }

  console.log('\n💡 Recommandations:');
  console.log('   1. Utilisez de vraies clés hCaptcha en production');
  console.log('   2. Vérifiez que DOCKER_ENV n\'est PAS défini en production');
  console.log('   3. Configurez Nginx pour gérer X-Forwarded-For de manière sécurisée');
  console.log('   4. Activez la vérification email obligatoire');
  console.log('\n');
}

/**
 * Exécuter tous les tests
 */
async function runAllTests(): Promise<void> {
  console.log('🧪 Démarrage des tests de sécurité CAPTCHA...\n');
  console.log('⚠️  Note: Ces tests doivent échouer (c\'est le comportement attendu)');
  console.log('On vérifie que le CAPTCHA BLOQUE bien les inscriptions non autorisées.\n');

  try {
    await testRegistrationWithoutCaptcha();
    await testRegistrationWithInvalidCaptcha();
    await testMultipleAttemptsWithoutCaptcha();
    await testCaptchaRequiredForAllEmails();
    await testHeaderSpoofing();
    await testSecurityConfiguration();

    displaySummary();
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    process.exit(1);
  }
}

// Exécuter les tests
runAllTests();
