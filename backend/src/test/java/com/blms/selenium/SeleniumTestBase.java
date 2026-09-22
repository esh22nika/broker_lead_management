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

    protected static final String BASE_URL = "http://localhost:5173";
    protected static final String DEMO_EMAIL = "admin@blms.com";
    protected static final String DEMO_PASSWORD = "admin123";

    @BeforeEach
    void setUp() {
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
        driver.get(BASE_URL);
        wait.until(d -> d.findElement(org.openqa.selenium.By.id("login-email")));

        driver.findElement(org.openqa.selenium.By.id("login-email")).sendKeys(DEMO_EMAIL);
        driver.findElement(org.openqa.selenium.By.id("login-password")).sendKeys(DEMO_PASSWORD);
        driver.findElement(org.openqa.selenium.By.id("login-submit-btn")).click();

        wait.until(d -> d.findElement(org.openqa.selenium.By.id("logout-btn")));
    }
}
