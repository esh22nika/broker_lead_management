package com.blms.selenium;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Status Workflow - Selenium Tests")
class StatusWorkflowTest extends SeleniumTestBase {

    @BeforeEach
    void loginAndCreateLead() {
        login();

        driver.findElement(By.cssSelector("input[name='name']")).sendKeys("Status Test Lead");
        driver.findElement(By.cssSelector("input[name='contactEmail']")).sendKeys("status@test.com");
        driver.findElement(By.cssSelector("button.btn-primary")).click();

        wait.until(d -> {
            var cells = d.findElements(By.tagName("td"));
            return cells.stream().anyMatch(c -> c.getText().contains("Status Test Lead"));
        });
    }

    @Test
    @DisplayName("New lead starts with NEW status")
    void newLeadHasNewStatus() {
        WebElement statusSelect = driver.findElement(By.cssSelector(".status-select"));
        Select select = new Select(statusSelect);

        assertEquals("NEW", select.getFirstSelectedOption().getAttribute("value"));
    }

    @Test
    @DisplayName("Change lead status from NEW to CONTACTED")
    void changeStatusToContacted() {
        WebElement statusSelect = driver.findElement(By.cssSelector(".status-select"));
        Select select = new Select(statusSelect);

        select.selectByValue("CONTACTED");

        wait.until(d -> {
            WebElement sel = d.findElement(By.cssSelector(".status-select"));
            return sel.getAttribute("class").contains("status-CONTACTED");
        });

        Select updated = new Select(driver.findElement(By.cssSelector(".status-select")));
        assertEquals("CONTACTED", updated.getFirstSelectedOption().getAttribute("value"));
    }

    @Test
    @DisplayName("Change lead status through full workflow to CONVERTED")
    void fullWorkflowToConverted() {
        WebElement statusSelect = driver.findElement(By.cssSelector(".status-select"));

        new Select(statusSelect).selectByValue("CONTACTED");
        wait.until(d -> d.findElement(By.cssSelector(".status-CONTACTED")));

        new Select(driver.findElement(By.cssSelector(".status-select"))).selectByValue("QUALIFIED");
        wait.until(d -> d.findElement(By.cssSelector(".status-QUALIFIED")));

        new Select(driver.findElement(By.cssSelector(".status-select"))).selectByValue("CONVERTED");
        wait.until(d -> d.findElement(By.cssSelector(".status-CONVERTED")));

        Select finalSelect = new Select(driver.findElement(By.cssSelector(".status-select")));
        assertEquals("CONVERTED", finalSelect.getFirstSelectedOption().getAttribute("value"));
    }
}
