package com.blms.selenium;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.junit.jupiter.api.extension.InvocationInterceptor;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.ReflectiveInvocationContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public abstract class SeleniumTestBase {

    protected WebDriver driver;
    protected WebDriverWait wait;

    @RegisterExtension
    final InvocationInterceptor failureScreenshot = new InvocationInterceptor() {
        @Override
        public void interceptTestMethod(Invocation<Void> invocation,
                ReflectiveInvocationContext<java.lang.reflect.Method> context,
                ExtensionContext extensionContext) throws Throwable {
            try {
                invocation.proceed();
            } catch (Throwable failure) {
                if (driver instanceof org.openqa.selenium.TakesScreenshot screenshots) {
                    try {
                        var directory = java.nio.file.Path.of("target", "failure-screenshots");
                        java.nio.file.Files.createDirectories(directory);
                        var filename = extensionContext.getRequiredTestClass().getSimpleName() + "-"
                                + context.getExecutable().getName() + "-" + java.util.UUID.randomUUID() + ".png";
                        java.nio.file.Files.write(directory.resolve(filename),
                                screenshots.getScreenshotAs(org.openqa.selenium.OutputType.BYTES));
                    } catch (Exception captureFailure) {
                        failure.addSuppressed(captureFailure);
                    }
                }
                throw failure;
            }
        }
    };

    protected static String getBaseUrl() {
        String prop = System.getProperty("baseUrl");
        if (prop != null && !prop.isBlank()) return prop;
        String env = System.getenv("BASE_URL");
        if (env != null && !env.isBlank()) return env;
        try (var socket = new java.net.Socket()) {
            socket.connect(new java.net.InetSocketAddress("localhost", 3000), 400);
            return "http://localhost:3000";
        } catch (Exception e) {
            return "http://localhost:5173";
        }
    }

    protected static boolean isServerRunning() {
        try {
            var client = java.net.http.HttpClient.newBuilder()
                .version(java.net.http.HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(3)).build();
            var response = client.send(java.net.http.HttpRequest.newBuilder(java.net.URI.create(BASE_URL))
                .timeout(Duration.ofSeconds(5)).GET().build(), java.net.http.HttpResponse.BodyHandlers.discarding());
            return response.statusCode() == 200;
        } catch (Exception ex) { return false; }
    }

    protected static final String BASE_URL = getBaseUrl();
    protected static final String DEMO_EMAIL = System.getenv().getOrDefault("SELENIUM_EMAIL", "admin@blms.com");
    protected static final String DEMO_PASSWORD = System.getenv().getOrDefault("SELENIUM_PASSWORD", "admin123");

    @BeforeEach
    void setUp() {
        org.junit.jupiter.api.Assertions.assertTrue(isServerRunning(),
                "Application is unavailable at " + BASE_URL + "; start the complete stack before browser tests.");

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--window-size=1920,1080");
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    protected void login() {
        driver.get(getBaseUrl());
        wait.until(d -> d.findElement(org.openqa.selenium.By.id("login-email")));

        driver.findElement(org.openqa.selenium.By.id("login-email")).sendKeys(DEMO_EMAIL);
        driver.findElement(org.openqa.selenium.By.id("login-password")).sendKeys(DEMO_PASSWORD);
        driver.findElement(org.openqa.selenium.By.id("login-submit-btn")).click();

        wait.until(d -> d.findElement(org.openqa.selenium.By.id("logout-btn")));
    }
}
