using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRMBackend.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Update_SQLConstraints_AuditableEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Objednavky_CenovePonuky_PoslednaCenovaPonukaId",
                table: "Objednavky");

            migrationBuilder.DropForeignKey(
                name: "FK_Tovary_Dodavatelia_DodavatelId",
                table: "Tovary");

            migrationBuilder.DropIndex(
                name: "IX_KontaktneOsoby_FirmaId_Email",
                table: "KontaktneOsoby");

            migrationBuilder.RenameColumn(
                name: "LastModifiedBy",
                table: "Tovary",
                newName: "VytvorilUzivatel");

            migrationBuilder.RenameColumn(
                name: "LastModified",
                table: "Tovary",
                newName: "VytvoreneDna");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Tovary",
                newName: "UpravilUzivatel");

            migrationBuilder.RenameColumn(
                name: "Created",
                table: "Tovary",
                newName: "UpraveneDna");

            migrationBuilder.RenameColumn(
                name: "LastModifiedBy",
                table: "TodoLists",
                newName: "VytvorilUzivatel");

            migrationBuilder.RenameColumn(
                name: "LastModified",
                table: "TodoLists",
                newName: "VytvoreneDna");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "TodoLists",
                newName: "UpravilUzivatel");

            migrationBuilder.RenameColumn(
                name: "Created",
                table: "TodoLists",
                newName: "UpraveneDna");

            migrationBuilder.RenameColumn(
                name: "LastModifiedBy",
                table: "TodoItems",
                newName: "VytvorilUzivatel");

            migrationBuilder.RenameColumn(
                name: "LastModified",
                table: "TodoItems",
                newName: "VytvoreneDna");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "TodoItems",
                newName: "UpravilUzivatel");

            migrationBuilder.RenameColumn(
                name: "Created",
                table: "TodoItems",
                newName: "UpraveneDna");

            migrationBuilder.RenameColumn(
                name: "LastModifiedBy",
                table: "Objednavky",
                newName: "VytvorilUzivatel");

            migrationBuilder.RenameColumn(
                name: "LastModified",
                table: "Objednavky",
                newName: "VytvoreneDna");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Objednavky",
                newName: "UpravilUzivatel");

            migrationBuilder.RenameColumn(
                name: "Created",
                table: "Objednavky",
                newName: "UpraveneDna");

            migrationBuilder.RenameColumn(
                name: "LastModifiedBy",
                table: "KategorieProduktov",
                newName: "VytvorilUzivatel");

            migrationBuilder.RenameColumn(
                name: "LastModified",
                table: "KategorieProduktov",
                newName: "VytvoreneDna");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "KategorieProduktov",
                newName: "UpravilUzivatel");

            migrationBuilder.RenameColumn(
                name: "Created",
                table: "KategorieProduktov",
                newName: "UpraveneDna");

            migrationBuilder.RenameColumn(
                name: "LastModifiedBy",
                table: "Firmy",
                newName: "VytvorilUzivatel");

            migrationBuilder.RenameColumn(
                name: "LastModified",
                table: "Firmy",
                newName: "VytvoreneDna");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Firmy",
                newName: "UpravilUzivatel");

            migrationBuilder.RenameColumn(
                name: "Created",
                table: "Firmy",
                newName: "UpraveneDna");

            migrationBuilder.RenameColumn(
                name: "LastModifiedBy",
                table: "Dodavatelia",
                newName: "VytvorilUzivatel");

            migrationBuilder.RenameColumn(
                name: "LastModified",
                table: "Dodavatelia",
                newName: "VytvoreneDna");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Dodavatelia",
                newName: "UpravilUzivatel");

            migrationBuilder.RenameColumn(
                name: "Created",
                table: "Dodavatelia",
                newName: "UpraveneDna");

            migrationBuilder.AddColumn<string>(
                name: "ChybaKlienta",
                table: "Objednavky",
                type: "text",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Objednavky_CenovePonuky_PoslednaCenovaPonukaId",
                table: "Objednavky",
                column: "PoslednaCenovaPonukaId",
                principalTable: "CenovePonuky",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Tovary_Dodavatelia_DodavatelId",
                table: "Tovary",
                column: "DodavatelId",
                principalTable: "Dodavatelia",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Objednavky_CenovePonuky_PoslednaCenovaPonukaId",
                table: "Objednavky");

            migrationBuilder.DropForeignKey(
                name: "FK_Tovary_Dodavatelia_DodavatelId",
                table: "Tovary");

            migrationBuilder.DropColumn(
                name: "ChybaKlienta",
                table: "Objednavky");

            migrationBuilder.RenameColumn(
                name: "VytvorilUzivatel",
                table: "Tovary",
                newName: "LastModifiedBy");

            migrationBuilder.RenameColumn(
                name: "VytvoreneDna",
                table: "Tovary",
                newName: "LastModified");

            migrationBuilder.RenameColumn(
                name: "UpravilUzivatel",
                table: "Tovary",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "UpraveneDna",
                table: "Tovary",
                newName: "Created");

            migrationBuilder.RenameColumn(
                name: "VytvorilUzivatel",
                table: "TodoLists",
                newName: "LastModifiedBy");

            migrationBuilder.RenameColumn(
                name: "VytvoreneDna",
                table: "TodoLists",
                newName: "LastModified");

            migrationBuilder.RenameColumn(
                name: "UpravilUzivatel",
                table: "TodoLists",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "UpraveneDna",
                table: "TodoLists",
                newName: "Created");

            migrationBuilder.RenameColumn(
                name: "VytvorilUzivatel",
                table: "TodoItems",
                newName: "LastModifiedBy");

            migrationBuilder.RenameColumn(
                name: "VytvoreneDna",
                table: "TodoItems",
                newName: "LastModified");

            migrationBuilder.RenameColumn(
                name: "UpravilUzivatel",
                table: "TodoItems",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "UpraveneDna",
                table: "TodoItems",
                newName: "Created");

            migrationBuilder.RenameColumn(
                name: "VytvorilUzivatel",
                table: "Objednavky",
                newName: "LastModifiedBy");

            migrationBuilder.RenameColumn(
                name: "VytvoreneDna",
                table: "Objednavky",
                newName: "LastModified");

            migrationBuilder.RenameColumn(
                name: "UpravilUzivatel",
                table: "Objednavky",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "UpraveneDna",
                table: "Objednavky",
                newName: "Created");

            migrationBuilder.RenameColumn(
                name: "VytvorilUzivatel",
                table: "KategorieProduktov",
                newName: "LastModifiedBy");

            migrationBuilder.RenameColumn(
                name: "VytvoreneDna",
                table: "KategorieProduktov",
                newName: "LastModified");

            migrationBuilder.RenameColumn(
                name: "UpravilUzivatel",
                table: "KategorieProduktov",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "UpraveneDna",
                table: "KategorieProduktov",
                newName: "Created");

            migrationBuilder.RenameColumn(
                name: "VytvorilUzivatel",
                table: "Firmy",
                newName: "LastModifiedBy");

            migrationBuilder.RenameColumn(
                name: "VytvoreneDna",
                table: "Firmy",
                newName: "LastModified");

            migrationBuilder.RenameColumn(
                name: "UpravilUzivatel",
                table: "Firmy",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "UpraveneDna",
                table: "Firmy",
                newName: "Created");

            migrationBuilder.RenameColumn(
                name: "VytvorilUzivatel",
                table: "Dodavatelia",
                newName: "LastModifiedBy");

            migrationBuilder.RenameColumn(
                name: "VytvoreneDna",
                table: "Dodavatelia",
                newName: "LastModified");

            migrationBuilder.RenameColumn(
                name: "UpravilUzivatel",
                table: "Dodavatelia",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "UpraveneDna",
                table: "Dodavatelia",
                newName: "Created");

            migrationBuilder.CreateIndex(
                name: "IX_KontaktneOsoby_FirmaId_Email",
                table: "KontaktneOsoby",
                columns: new[] { "FirmaId", "Email" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Objednavky_CenovePonuky_PoslednaCenovaPonukaId",
                table: "Objednavky",
                column: "PoslednaCenovaPonukaId",
                principalTable: "CenovePonuky",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Tovary_Dodavatelia_DodavatelId",
                table: "Tovary",
                column: "DodavatelId",
                principalTable: "Dodavatelia",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
