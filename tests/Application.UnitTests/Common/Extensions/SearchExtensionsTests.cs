using System.Linq.Expressions;
using CRMBackend.Application.Common.Extensions;
using FluentAssertions;
using NUnit.Framework;

namespace CRMBackend.Application.UnitTests.Common.Extensions;

[TestFixture]
public class SearchExtensionsTests
{
    private class TestEntity
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? NullableField { get; set; }
        public ChildEntity? Child { get; set; }
    }

    private class ChildEntity
    {
        public int ChildId { get; set; }
        public string? ChildName { get; set; }
        public string? ChildDescription { get; set; }
    }

    private List<TestEntity> _testData = null!;
    private IQueryable<TestEntity> _queryableTestData = null!;

    [SetUp]
    public void Setup()
    {
        _testData = new List<TestEntity>
        {
            new() { Id = 1, Name = "Apple", Description = "A fruit", Child = new ChildEntity { ChildId = 101, ChildName = "Core", ChildDescription = "Seeds inside" } },
            new() { Id = 2, Name = "Banana", Description = "Another fruit", Child = new ChildEntity { ChildId = 102, ChildName = "Peel", ChildDescription = "Yellow skin" } },
            new() { Id = 3, Name = "Carrot", Description = "A vegetable", Child = new ChildEntity { ChildId = 103, ChildName = "Root", ChildDescription = "Orange color" } },
            new() { Id = 4, Name = "Apricot", Description = "Fruit with stone", Child = new ChildEntity { ChildId = 104, ChildName = "Pit", ChildDescription = "Hard kernel" } },
            new() { Id = 5, Name = "Orange", Description = "Citrus Fruit", Child = new ChildEntity { ChildId = 105, ChildName = "Zest", ChildDescription = "Outer layer" } },
            new() { Id = 6, Name = "NullTest", Description = null, Child = null },
            new() { Id = 7, Name = " MixedCase ", Description = "Case Test", Child = new ChildEntity { ChildId = 106, ChildName = "Wrapper", ChildDescription = " Child Description With CASE " } },
            new() { Id = 8, Name = "NoChildMatch", Description = "Parent Only", Child = new ChildEntity { ChildId = 107, ChildName = "Xyz", ChildDescription = "UniqueChildDesc" } }
        };
        _queryableTestData = _testData.AsQueryable();
    }

    private Expression<Func<TestEntity, string?>>[] GetSearchPropertiesWithChild() => new Expression<Func<TestEntity, string?>>[]
    {
        e => e.Name,
        e => e.Description,
        e => e.Child!.ChildName,
        e => e.Child!.ChildDescription
    };

     private Expression<Func<TestEntity, string?>>[] GetChildOnlySearchProperties() => new Expression<Func<TestEntity, string?>>[]
    {
        e => e.Child!.ChildName,
        e => e.Child!.ChildDescription
    };

    private Expression<Func<TestEntity, string?>>[] GetSearchProperties() => new Expression<Func<TestEntity, string?>>[]
    {
        e => e.Name,
        e => e.Description
    };

    [Test]
    public void ApplySearch_NullSearchTerm_ReturnsOriginalQuery()
    {
        string? searchTerm = null;
        var result = _queryableTestData.ApplySearch(searchTerm, GetSearchProperties());
        result.Should().BeSameAs(_queryableTestData);
        result.Count().Should().Be(_testData.Count);
    }

    [Test]
    public void ApplySearch_EmptySearchTerm_ReturnsOriginalQuery()
    {
        string searchTerm = "";
        var result = _queryableTestData.ApplySearch(searchTerm, GetSearchProperties());
        result.Should().BeSameAs(_queryableTestData);
        result.Count().Should().Be(_testData.Count);
    }

    [Test]
    public void ApplySearch_WhitespaceSearchTerm_ReturnsOriginalQuery()
    {
        string searchTerm = "   ";
        var result = _queryableTestData.ApplySearch(searchTerm, GetSearchProperties());
        result.Should().BeSameAs(_queryableTestData);
        result.Count().Should().Be(_testData.Count);
    }

    [Test]
    public void ApplySearch_NoProperties_ReturnsOriginalQuery()
    {
        string searchTerm = "Apple";
        var noProperties = Array.Empty<Expression<Func<TestEntity, string?>>>();
        var result = _queryableTestData.ApplySearch(searchTerm, noProperties);
        result.Should().BeSameAs(_queryableTestData);
        result.Count().Should().Be(_testData.Count);
    }

    [TestCase("Apple", 1)]
    [TestCase("apple", 1)]
    [TestCase("fruit", 4)]
    [TestCase("FRUIT", 4)]
    [TestCase("NullTest", 1)]
    [TestCase("case", 1)]
    [TestCase("mixedcase", 1)]
    public void ApplySearch_ValidSearchTerm_FiltersCorrectly(string searchTerm, int expectedCount)
    {
        var result = _queryableTestData.ApplySearch(searchTerm, GetSearchProperties());
        var resultList = result.ToList();

        resultList.Count.Should().Be(expectedCount);
        foreach (var item in resultList)
        {
            bool nameMatch = item.Name?.ToLower().Contains(searchTerm.Trim().ToLower()) ?? false;
            bool descMatch = item.Description?.ToLower().Contains(searchTerm.Trim().ToLower()) ?? false;
            (nameMatch || descMatch).Should().BeTrue($"Item {item.Id} ('{item.Name}', '{item.Description}') should match '{searchTerm}'");
        }
    }

     [Test]
    public void ApplySearch_SearchTermNotInAnyField_ReturnsEmpty()
    {
        string searchTerm = "XYZNonExistent";
        var result = _queryableTestData.ApplySearch(searchTerm, GetSearchProperties());
        result.Should().BeEmpty();
    }

     [Test]
    public void ApplySearch_SearchTermWithLeadingTrailingWhitespace_FiltersCorrectly()
    {
        string searchTerm = "  Banana  ";
        var result = _queryableTestData.ApplySearch(searchTerm, GetSearchProperties());
        var resultList = result.ToList();
        resultList.Count.Should().Be(1);
        resultList[0].Id.Should().Be(2);
    }

    [Test]
    public void ApplySearch_UsesDifferentProperties_FiltersCorrectly()
    {
        string searchTerm = "stone";
        var descriptionOnly = new Expression<Func<TestEntity, string?>>[] { e => e.Description };
        var result = _queryableTestData.ApplySearch(searchTerm, descriptionOnly);
        var resultList = result.ToList();
        resultList.Count.Should().Be(1);
        resultList[0].Id.Should().Be(4);
    }


    [TestCase("Core", 1)]
    [TestCase("peel", 1)]
    [TestCase("yellow skin", 1)]
    [TestCase("Orange color", 1)]
    [TestCase("orange", 2)]
    [TestCase("UniqueChildDesc", 1)]
    public void ApplySearch_WithChildProperties_FiltersCorrectly(string searchTerm, int expectedCount)
    {
        var result = _queryableTestData.ApplySearch(searchTerm, GetSearchPropertiesWithChild());
        var resultList = result.ToList();

        resultList.Count.Should().Be(expectedCount);

        foreach (var item in resultList)
        {
            bool nameMatch = item.Name?.ToLower().Contains(searchTerm.Trim().ToLower()) ?? false;
            bool descMatch = item.Description?.ToLower().Contains(searchTerm.Trim().ToLower()) ?? false;
            bool childNameMatch = item.Child?.ChildName?.ToLower().Contains(searchTerm.Trim().ToLower()) ?? false;
            bool childDescMatch = item.Child?.ChildDescription?.ToLower().Contains(searchTerm.Trim().ToLower()) ?? false;

            (nameMatch || descMatch || childNameMatch || childDescMatch).Should().BeTrue(
                $"Item {item.Id} ('{item.Name}', '{item.Description}', Child: '{item.Child?.ChildName}', '{item.Child?.ChildDescription}') should match '{searchTerm}'");
        }
    }

    [Test]
    public void ApplySearch_ChildOnlyProperties_FiltersCorrectly()
    {
        string searchTerm = "kernel";
        var result = _queryableTestData.ApplySearch(searchTerm, GetChildOnlySearchProperties());
        var resultList = result.ToList();
        resultList.Count.Should().Be(1);
        resultList[0].Id.Should().Be(4);
    }

    [Test]
    public void ApplySearch_SearchTermMatchingNullChild_DoesNotThrow()
    {
        string searchTerm = "Anything";
        Action act = () => _queryableTestData.ApplySearch(searchTerm, GetSearchPropertiesWithChild()).ToList();
        act.Should().NotThrow<NullReferenceException>();
        var result = _queryableTestData.ApplySearch("NonExistentTerm", GetSearchPropertiesWithChild()).ToList();
        result.Should().BeEmpty();
    }
     [Test]
    public void ApplySearch_SearchTermMatchingOnlyParentWhenChildIsNull_FiltersCorrectly()
    {
        _testData.Add(new TestEntity { Id = 9, Name = "MatchableParent", Description = "Find This", Child = null });
        _queryableTestData = _testData.AsQueryable();

        string searchTerm = "Find This";
        var result = _queryableTestData.ApplySearch(searchTerm, GetSearchPropertiesWithChild());
        var resultList = result.ToList();
        resultList.Count.Should().Be(1);
        resultList[0].Id.Should().Be(9);
    }
}
