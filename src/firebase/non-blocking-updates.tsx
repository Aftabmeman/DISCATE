'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  increment,
  CollectionReference,
  DocumentReference,
  SetOptions,
  Firestore,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', 
        requestResourceData: data,
      })
    )
  })
}

/**
 * Increments user coins and assessment counts in Firestore.
 * This satisfies the 'create' and 'update' security rules.
 */
export function incrementUserStats(db: Firestore, userId: string, coins: number, isAssessment: boolean = true) {
  // Using a consistent path for profile stats
  const profileRef = doc(db, 'users', userId, 'profile', 'stats'); 
  
  setDoc(profileRef, {
    id: userId,
    totalCoins: increment(coins),
    assessmentsDone: isAssessment ? increment(1) : increment(0),
    updatedAt: new Date().toISOString()
  }, { merge: true }).catch(error => {
    // Silently log or emit error
    console.warn("Progress update failed silently:", error);
  });
}

/**
 * Initiates an addDoc operation for a collection reference.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      )
    });
  return promise;
}

/**
 * Initiates an updateDoc operation for a document reference.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
}

/**
 * Initiates a deleteDoc operation for a document reference.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
}
