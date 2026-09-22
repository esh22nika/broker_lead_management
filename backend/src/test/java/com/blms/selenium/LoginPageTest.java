package com.blms.selenium;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Login Page - Selenium Tests")
class LoginPageTest extends SeleniumTestBase {

    @Test
    @DisplayName("Login page loads with email and password fields")
    void loginPageLoads() {
        driver.get(BASE_URL);
        wait.until(d -> d.findElement(By.id("login-email")));

        WebElement emailField = driver.findElement(By.id("login-email"));
        WebElement passwordField = driver.findElement(By.id("login-password"));
        WebElement submitBtn = driver.findElement(By.id("login-submit-btn"));

        assertTrue(emailField.isDisplayed());
        assertTrue(passwordField.isDisplayed());
        assertTrue(submitBtn.isDisplayed());
    }

    @Test
    @DisplayName("Successful login with demo credentials redirects to main app")
    void loginWithDemoCredentials() {
        login();
        WebElement logoutBtn = driver.findElement(By.id("logout-btn"));
        assertTrue(logoutBtn.isDisplayed());
    }

    @Test
    @DisplayName("Invalid credentials show error message")
    void loginWithInvalidCredentials() {
        driver.get(BASE_URL);
        wait.until(d -> d.findElement(By.id("login-email")));

        driver.findElement(By.id("login-email")).sendKeys("wrong@test.com");
        driver.findElement(By.id("login-password")).sendKeys("wrongpass");
        driver.findElement(By.id("login-submit-btn")).click();

        wait.until(d -> d.findElement(By.cssSelector(".login-error")));
        WebElement error = driver.findElement(By.cssSelector(".login-error"));
        assertTrue(error.isDisplayed());
    }

    @Test
    @DisplayName("Logout returns to login page")
    void logoutReturnsToLoginPage() {
        login();
        driver.findElement(By.id("logout-btn")).click();

        wait.until(d -> d.findElement(By.id("login-email")));
        assertTrue(driver.findElement(By.id("login-email")).isDisplayed());
    }
}
