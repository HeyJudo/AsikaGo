using System.Net;
using System.Text.Json;
using AsikaGo.Api.Data;
using AsikaGo.Api.Data.Entities;
using AsikaGo.Api.Features.Assessment;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace AsikaGo.Tests;

public class AssessmentTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AssessmentTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task AssessmentOptions_ReturnsThreeCategories_NoCities()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/assessment/options");
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            Assert.Fail($"Expected OK but got {response.StatusCode}. Content: {errorContent}");
        }

        var content = await response.Content.ReadAsStringAsync();
        var options = JsonSerializer.Deserialize<AssessmentOptionsResponse>(
            content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        // Verify returns the 3 seeded categories, sorted by name
        Assert.NotNull(options);
        Assert.Equal(3, options.Categories.Count);

        // Verify all categories have valid data
        foreach (var c in options.Categories)
        {
            Assert.True(c.Id != Guid.Empty, "Category ID must not be empty");
            Assert.True(!string.IsNullOrEmpty(c.Name), "Category name must not be empty");
            Assert.True(!string.IsNullOrEmpty(c.Description), "Category description must not be empty");
        }

        // Verify sorted by name
        var categoryNames = options.Categories.Select(c => c.Name).ToList();
        for (int i = 1; i < categoryNames.Count; i++)
        {
            Assert.True(string.Compare(categoryNames[i - 1], categoryNames[i], StringComparison.Ordinal) <= 0);
        }

        // Verify businessTypes from confirmed list
        Assert.Equal(new[] { "Sole Proprietorship", "Partnership", "Corporation", "One Person Corporation" }, options.BusinessTypes);

        // Verify registrationStatuses comes from RegistrationStatus enum
        var expectedStatuses = Enum.GetValues<RegistrationStatus>().Select(s => s.ToString()).ToArray();
        Assert.Equal(expectedStatuses, options.RegistrationStatuses);
    }

    [Fact]
    public async Task AssessmentOptions_AnonymousUserCanCall()
    {
        using var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/assessment/options");
        if (response.StatusCode != HttpStatusCode.OK)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            Assert.Fail($"Expected OK but got {response.StatusCode}. Content: {errorContent}");
        }
    }

    [Fact]
    public async Task PutBusinessProfile_CreatesProfileWhenNoneExists()
    {
        using var client = _factory.CreateClient();
        var userToken = "11111111-1111-1111-1111-111111111001";  // Valid GUID matching test user sub
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {userToken}");

        var request = new SaveBusinessProfileRequest(
            BusinessName: "Test Business",
            BusinessType: "Sole Proprietorship",
            CategoryId: Guid.Parse("22222222-2222-2222-2222-222222222201"), // FoodAndBeverageId from seed data
            RegistrationStatus: RegistrationStatus.Planning
        );

        var content = JsonSerializer.Serialize(request);
        var response = await client.PutAsync("/api/assessment/business-profile",
            new StringContent(content, System.Text.Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var responseContent = await response.Content.ReadAsStringAsync();
        var businessProfile = JsonSerializer.Deserialize<BusinessProfileResponse>(
            responseContent, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(businessProfile);
        Assert.NotEqual(default, businessProfile.Id);
        Assert.Equal("Test Business", businessProfile.BusinessName);
        Assert.Equal("Sole Proprietorship", businessProfile.BusinessType);
        Assert.Equal("Pasig", businessProfile.CityName);
    }

    [Fact]
    public async Task PutBusinessProfile_Returns401WithoutLoginToken()
    {
        using var client = _factory.CreateClient();

        var request = new SaveBusinessProfileRequest(
            BusinessName: "Test Business",
            BusinessType: "Sole Proprietorship",
            CategoryId: Guid.Parse("11111111-1111-1111-1111-111111111001"),
            RegistrationStatus: RegistrationStatus.Planning
        );

        var content = JsonSerializer.Serialize(request);
        var response = await client.PutAsync("/api/assessment/business-profile",
            new StringContent(content, System.Text.Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}