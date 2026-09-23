package com.blms.selenium;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Dashboard - Selenium Tests")
class DashboardTest extends SeleniumTestBase {

    @BeforeEach
    void loginFirst() {
        login();
    }

    @Test
    @DisplayName("Dashboard section is visible after login")
    void dashboardVisible() {
        wait.until(d -> d.findElement(By.cssSelector(".dashboard-grid")));
        WebElement dashboard = driver.findElement(By.cssSelector(".dashboard-grid"));
        assertTrue(dashboard.isDisplayed());
    }

    @Test
    @DisplayName("Dashboard shows Total Leads stat card")
    void dashboardShowsTotalLeads() {
        wait.until(d -> d.findElement(By.cssSelector(".stat-total")));
        WebElement totalCard = driver.findElement(By.cssSelector(".stat-total"));
        assertTrue(totalCard.isDisplayed());

        WebElement label = totalCard.findElement(By.cssSelector(".stat-label"));
        assertEquals("total leads", label.getText().toLowerCase());
    }

    @Test
    @DisplayName("Dashboard shows status breakdown cards")
    void dashboardShowsStatusCards() {
        wait.until(d -> d.findElements(By.cssSelector(".stat-card")).size() >= 6);
        List<WebElement> cards = driver.findElements(By.cssSelector(".stat-card"));
        // 1 total + 5 statuses = 6 cards
        assertTrue(cards.size() >= 6, "Dashboard should show at least 6 stat cards");
    }
}
