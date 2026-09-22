package com.blms.selenium;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Create Lead - Selenium Tests")
class CreateLeadTest extends SeleniumTestBase {

    @BeforeEach
    void loginFirst() {
        login();
    }

    @Test
    @DisplayName("Create lead form is visible after login")
    void createLeadFormVisible() {
        WebElement nameInput = driver.findElement(By.cssSelector("input[name='name']"));
        WebElement submitBtn = driver.findElement(By.cssSelector("button.btn-primary"));

        assertTrue(nameInput.isDisplayed());
        assertTrue(submitBtn.isDisplayed());
    }

    @Test
    @DisplayName("Create a lead and verify it appears in the list")
    void createLeadAndVerifyInList() {
        driver.findElement(By.cssSelector("input[name='name']")).sendKeys("Selenium Test Lead");
        driver.findElement(By.cssSelector("input[name='contactPhone']")).sendKeys("9876543210");
        driver.findElement(By.cssSelector("input[name='contactEmail']")).sendKeys("selenium@test.com");
        driver.findElement(By.cssSelector("input[name='source']")).sendKeys("Automated Test");
        driver.findElement(By.cssSelector("textarea[name='notes']")).sendKeys("Created by Selenium");
        driver.findElement(By.cssSelector("button.btn-primary")).click();

        wait.until(d -> {
            var cells = d.findElements(By.tagName("td"));
            return cells.stream().anyMatch(c -> c.getText().contains("Selenium Test Lead"));
        });

        var cells = driver.findElements(By.tagName("td"));
        boolean found = cells.stream().anyMatch(c -> c.getText().contains("Selenium Test Lead"));
        assertTrue(found, "Created lead should appear in the leads table");
    }

    @Test
    @DisplayName("Empty name shows validation error")
    void emptyNameShowsError() {
        driver.findElement(By.cssSelector("input[name='contactEmail']")).sendKeys("test@test.com");
        driver.findElement(By.cssSelector("button.btn-primary")).click();

        wait.until(d -> d.findElement(By.cssSelector(".error-msg")));
        WebElement error = driver.findElement(By.cssSelector(".error-msg"));
        assertTrue(error.getText().contains("Name is required"));
    }
}
