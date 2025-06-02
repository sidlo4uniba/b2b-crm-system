using FluentValidation;
using CRMBackend.Domain.Enums;

namespace CRMBackend.Application.TodoLists.Commands.AddTodoItem;

public class AddTodoItemCommandValidator : AbstractValidator<AddTodoItemCommand>
{
    public AddTodoItemCommandValidator()
    {
        RuleFor(v => v.ListId)
            .NotEmpty()
            .WithMessage("ListId is required.")
            .GreaterThan(0)
            .WithMessage("ListId must be greater than 0.");

        RuleFor(v => v.Title)
            .NotEmpty()
            .WithMessage("Title is required.")
            .MaximumLength(200)
            .WithMessage("Title must not exceed 200 characters.");

        RuleFor(v => v.Reminder)
            .GreaterThan(DateTime.Now)
            .When(v => v.Reminder != default)
            .WithMessage("Reminder must be in the future.");
    }
} 