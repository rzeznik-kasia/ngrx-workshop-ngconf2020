import { Component, OnInit } from "@angular/core";
import { Store } from '@ngrx/store';
import { Observable } from "rxjs";
import {
  State,
  selectAllBooks,
  selectActiveBook,
  selectBooksEarningsTotals,
} from "src/app/shared/state";

import {
  BookModel,
  calculateBooksGrossEarnings,
  BookRequiredProps
} from "src/app/shared/models";
import { BooksService } from "src/app/shared/services";
import { BooksPageActions, BooksApiActions } from '../../actions';

@Component({
  selector: "app-books",
  templateUrl: "./books-page.component.html",
  styleUrls: ["./books-page.component.css"]
})
export class BooksPageComponent implements OnInit {
  books$ = this.store.select(selectAllBooks);
  currentBook$ = this.store.select(selectActiveBook);
  total$ = this.store.select(selectBooksEarningsTotals);

  constructor(
    private booksService: BooksService,
    private store: Store<State>,
  ) {}


  ngOnInit() {
    this.store.dispatch(BooksPageActions.enterBookPage());
    this.getBooks();
  }

  getBooks() {
    this.booksService.all().subscribe(books => {
      this.store.dispatch(BooksApiActions.booksLoaded({ books }));
    });
  }

  onSelect(book: BookModel) {
    this.store.dispatch(BooksPageActions.selectBook({ bookId: book.id }));
  }

  onCancel() {
    this.removeSelectedBook();
  }

  removeSelectedBook() {
    this.store.dispatch(BooksPageActions.clearSelectedBook());
  }

  onSave(book: BookRequiredProps | BookModel) {
    if ("id" in book) {
      this.updateBook(book);
    } else {
      this.saveBook(book);
    }
  }

  saveBook(bookProps: BookRequiredProps) {
    this.store.dispatch(BooksPageActions.createBook({ book: bookProps }));

    this.booksService.create(bookProps).subscribe((book) => {
      this.getBooks();
      this.removeSelectedBook();

      this.store.dispatch(BooksApiActions.bookCreated({ book }));
    });
  }

  updateBook(book: BookModel) {
    this.store.dispatch(BooksPageActions.updateBook({ bookId: book.id, changes: book }));

    this.booksService.update(book.id, book).subscribe((book) => {
      this.store.dispatch(BooksApiActions.bookUpdated({ book }));
    });
  }

  onDelete(book: BookModel) {
    this.store.dispatch(BooksPageActions.deleteBook({ bookId: book.id }));

    this.booksService.delete(book.id).subscribe(() => {
      this.getBooks();
      this.removeSelectedBook();

      this.store.dispatch(BooksApiActions.bookDeleted({ bookId: book.id }));
    });
  }
}
