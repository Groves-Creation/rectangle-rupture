plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.litsuper.distribution"
    compileSdk = 36
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        applicationId = "com.litsuper.distribution"
        minSdk = 26
        targetSdk = 36
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    flavorDimensions += "env"

    productFlavors {
        create("dev") {
            dimension = "env"
            applicationId = "com.litsuper.distribution.dev"
            versionNameSuffix = "-dev"
            manifestPlaceholders["appLabel"] = "LIT Dev"
        }
        create("staging") {
            dimension = "env"
            applicationId = "com.litsuper.distribution.staging"
            versionNameSuffix = "-staging"
            manifestPlaceholders["appLabel"] = "LIT Staging"
        }
        create("prod") {
            dimension = "env"
            applicationId = "com.litsuper.distribution"
            manifestPlaceholders["appLabel"] = "LIT Distribution"
        }
    }

    buildTypes {
        release {
            // TODO: Add your own signing config for the release build.
            // Signing with the debug keys for now, so `flutter run --release` works.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

// Android Gradle Plugin does not support running on Java 25, which is what is
// installed on the dev machines. Pin every JVM compilation in this module to a
// Java 17 toolchain so the build never depends on the JDK that happens to be on
// PATH. `settings.gradle.kts` registers the Foojay resolver so Gradle can
// provision a 17 toolchain if none is detected locally.
java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}

kotlin {
    jvmToolchain(17)
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}
