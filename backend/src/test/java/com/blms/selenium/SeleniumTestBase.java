package com.blms.selenium;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public abstract class SeleniumTestBase {

    protected WebDriver driver;
    protected WebDriverWait wait;

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
        try (var socket = new java.net.Socket()) {
            socket.connect(new java.net.InetSocketAddress("localhost", 3000), 400);
            return true;
        } catch (Exception e) {
            try (var s2 = new java.net.Socket()) {
                s2.connect(new java.net.InetSocketAddress("localhost", 5173), 400);
                return true;
            } catch (Exception e2) {
                return false;
            }
        }
    }

    protected static final String BASE_URL = getBaseUrl();
    protected static final String DEMO_EMAIL = "admin@blms.com";
    protected static final String DEMO_PASSWORD = "admin123";

    @BeforeEach
    void setUp() {
        org.junit.jupiter.api.Assumptions.assumeTrue(isServerRunning(),
                "Live application server is not currently reachable on port 3000 or 5173; skipping browser tests.");

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
