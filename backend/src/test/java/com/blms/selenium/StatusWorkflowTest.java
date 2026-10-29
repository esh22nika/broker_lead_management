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
    private String leadName;

    private WebElement statusSelect() {
        return driver.findElement(By.xpath("//tr[td[contains(., '" + leadName + "')]]//select[contains(@class, 'status-select')]"));
    }

    @BeforeEach
    void loginAndCreateLead() {
        login();
        leadName = "Status Test Lead " + java.util.UUID.randomUUID();

        driver.findElement(By.cssSelector("input[name='name']")).sendKeys(leadName);
        driver.findElement(By.cssSelector("input[name='contactEmail']")).sendKeys("status@test.com");
        driver.findElement(By.cssSelector("button.btn-primary")).click();

        wait.until(d -> {
            var cells = d.findElements(By.tagName("td"));
            return cells.stream().anyMatch(c -> c.getText().contains(leadName));
        });
    }

    @Test
    @DisplayName("New lead starts with NEW status")
    void newLeadHasNewStatus() {
        WebElement statusSelect = statusSelect();
        Select select = new Select(statusSelect);

        assertEquals("NEW", select.getFirstSelectedOption().getAttribute("value"));
    }

    @Test
    @DisplayName("Change lead status from NEW to CONTACTED")
    void changeStatusToContacted() {
        WebElement statusSelect = statusSelect();
        Select select = new Select(statusSelect);

        select.selectByValue("CONTACTED");

        wait.until(d -> {
            WebElement sel = statusSelect();
            return sel.getAttribute("class").contains("status-CONTACTED");
        });

        Select updated = new Select(statusSelect());
        assertEquals("CONTACTED", updated.getFirstSelectedOption().getAttribute("value"));
    }

    @Test
    @DisplayName("Change lead status through full workflow to CONVERTED")
    void fullWorkflowToConverted() {
        WebElement statusSelect = statusSelect();

        new Select(statusSelect).selectByValue("CONTACTED");
        wait.until(d -> statusSelect().getAttribute("class").contains("status-CONTACTED"));

        new Select(statusSelect()).selectByValue("QUALIFIED");
        wait.until(d -> statusSelect().getAttribute("class").contains("status-QUALIFIED"));

        new Select(statusSelect()).selectByValue("CONVERTED");
        wait.until(d -> statusSelect().getAttribute("class").contains("status-CONVERTED"));

        Select finalSelect = new Select(statusSelect());
        assertEquals("CONVERTED", finalSelect.getFirstSelectedOption().getAttribute("value"));
    }
}
