using System.Net;
using System.Text.Json;
using AsikaGo.Api.Data.Entities;
using AsikaGo.Api.Features.Assessment;
using Microsoft.AspNetCore.Mvc.Testing;

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
}