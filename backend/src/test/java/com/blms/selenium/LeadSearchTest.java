package com.blms.selenium;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Search Leads - Selenium Tests")
class LeadSearchTest extends SeleniumTestBase {
    private String leadName;

    @BeforeEach
    void loginAndCreateTestData() {
        login();

        leadName = "Searchable Person " + java.util.UUID.randomUUID();
        // Create a lead to search for
        driver.findElement(By.cssSelector("input[name='name']")).sendKeys(leadName);
        driver.findElement(By.cssSelector("input[name='contactEmail']")).sendKeys("searchable@example.com");
        driver.findElement(By.cssSelector("input[name='source']")).sendKeys("SearchTest");
        driver.findElement(By.cssSelector("button.btn-primary")).click();

        wait.until(d -> {
            var cells = d.findElements(By.tagName("td"));
            return cells.stream().anyMatch(c -> c.getText().contains(leadName));
        });
    }

    @Test
    @DisplayName("Search by name returns matching leads")
    void searchByName() {
        WebElement searchInput = driver.findElement(By.cssSelector(".search-bar input"));
        searchInput.sendKeys("Searchable");

        driver.findElement(By.cssSelector(".search-bar button.btn-primary")).click();

        wait.until(d -> {
            var cells = d.findElements(By.tagName("td"));
            return cells.stream().anyMatch(c -> c.getText().contains(leadName));
        });

        var cells = driver.findElements(By.tagName("td"));
        boolean found = cells.stream().anyMatch(c -> c.getText().contains(leadName));
        assertTrue(found, "Search results should contain the matching lead");
    }

    @Test
    @DisplayName("Clear search reloads all leads")
    void clearSearchReloadsAll() {
        WebElement searchInput = driver.findElement(By.cssSelector(".search-bar input"));
        searchInput.sendKeys("Searchable");
        driver.findElement(By.cssSelector(".search-bar button.btn-primary")).click();

        wait.until(d -> d.findElement(By.cssSelector(".search-bar .btn-secondary")));
        driver.findElement(By.cssSelector(".search-bar .btn-secondary")).click();

        wait.until(d -> d.findElement(By.tagName("table")));
        assertTrue(driver.findElement(By.tagName("table")).isDisplayed());
    }
}
